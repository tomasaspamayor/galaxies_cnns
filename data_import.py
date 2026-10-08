"""
Import ZooSpec + PhotoObjDR7 from SciServer CasJobs into a local CSV.

1. Prompt for SciServer credentials and authenticate.
2. Build MyDB.ZooSpecPhoto with the JOIN in 'DR19'.
3. Download the table to CSV in chunks, with progress output.
"""

import os
import time
import getpass
from SciServer import Authentication, CasJobs

# Configurations
CONTEXT = "DR19"
TABLE_NAME = "ZooSpecPhoto"
OUTPUT_CSV = "ZooSpecPhoto.csv"
CHUNK_ROWS = 20000
EXPECTED_ROWS = 659272

READY, STARTED, CANCELING, CANCELLED, FAILED, FINISHED = range(6)

# Authentications for SciServer
USERNAME = input("SciServer username: ").strip()
PASSWORD = getpass.getpass("SciServer password: ")

print("Authenticating...", flush=True)
try:
    token = Authentication.login(USERNAME, PASSWORD)
except Exception as e:
    msg = str(e)
    if "401" in msg:
        raise SystemExit("Wrong username or password.")
    raise
if not token:
    raise SystemExit("Authentication failed!")
print("Authentication successful.", flush=True)


def query(sql, context="MyDB"):
    return CasJobs.getPandasDataFrameFromQuery(queryString=sql, context=context)

def run_job(sql, context):
    """Submit a CasJob, print progress, and block until it finishes."""
    job_id = CasJobs.submitJob(sql=sql, context=context)
    print(f"  Job ID: {job_id}", flush=True)
    start = time.time()
    while True:
        status = CasJobs.getJobStatus(job_id)
        if isinstance(status, list):
            status = status[0]
        code = status.get("Status")
        print(f"  [{int(time.time() - start):>4}s] status={code}", flush=True)
        if code == FINISHED:
            return
        if code in (CANCELING, CANCELLED, FAILED):
            raise Exception(f"Job failed ({code}): {status.get('Message', '')}")
        time.sleep(10)


# Table build
def table_row_count():
    try:
        return int(query(f"SELECT COUNT(*) AS n FROM {TABLE_NAME}").iloc[0, 0])
    except Exception:
        return None

n_rows = table_row_count()
if n_rows == EXPECTED_ROWS:
    print(f"MyDB.{TABLE_NAME} already exists with {n_rows} rows. Skipping the JOIN.", flush=True)
else:
    print(f"Cleaning MyDB.{TABLE_NAME}...", flush=True)
    run_job(f"IF OBJECT_ID('{TABLE_NAME}') IS NOT NULL DROP TABLE {TABLE_NAME}", "MyDB")

    join_sql = f"""
    SELECT ZooSpec.*, PhotoObjDR7.*
    INTO MyDB.{TABLE_NAME}
    FROM ZooSpec INNER JOIN PhotoObjDR7
    ON PhotoObjDR7.dr7objid = ZooSpec.dr7objid
    """
    print(f"Submitting JOIN to context '{CONTEXT}'...", flush=True)
    run_job(join_sql, CONTEXT)
    n_rows = table_row_count()

print(f"Table has {n_rows} rows (expected {EXPECTED_ROWS}).", flush=True)


# Table download as CSV
order_col = query(f"SELECT TOP 1 * FROM {TABLE_NAME}").columns[0]
print(f"Paging on '{order_col}'", flush=True)

try:
    run_job(f"CREATE INDEX ix_{TABLE_NAME}_key ON {TABLE_NAME}([{order_col}])", "MyDB")
except Exception as e:
    print(f"  Index step skipped: {str(e)[:120]}", flush=True)

def sql_literal(v):
    return str(v) if isinstance(v, (int, float)) or hasattr(v, "dtype") and v.dtype.kind in "iuf" else "'" + str(v).replace("'", "''") + "'"

def fetch_page(last_key, rows, retries=4):
    where = f"WHERE [{order_col}] > {sql_literal(last_key)} " if last_key is not None else ""
    sql = f"SELECT TOP {rows} * FROM {TABLE_NAME} {where}ORDER BY [{order_col}]"
    for attempt in range(1, retries + 1):
        try:
            return query(sql)
        except Exception as e:
            print(f"  Page failed (attempt {attempt}/{retries}): {str(e)[:120]}", flush=True)
            time.sleep(5 * attempt)
    raise SystemExit("Giving up on this page. Try a smaller CHUNK_ROWS.")

if os.path.exists(OUTPUT_CSV):
    os.remove(OUTPUT_CSV)

written, last_key, first = 0, None, True
t0 = time.time()
while True:
    chunk = fetch_page(last_key, CHUNK_ROWS)
    if chunk.empty:
        break
    chunk.to_csv(OUTPUT_CSV, mode="a", header=first, index=False)
    first = False
    written += len(chunk)
    last_key = chunk[order_col].iloc[-1]
    print(f"  {written}/{n_rows} rows written ({int(time.time() - t0)}s)", flush=True)

print(f"Saved {written} rows to {OUTPUT_CSV}", flush=True)
if written != EXPECTED_ROWS:
    print(f"WARNING: expected {EXPECTED_ROWS} rows but wrote {written}.")
