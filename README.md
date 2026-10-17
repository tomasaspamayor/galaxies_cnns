# ZooSpec + PhotoObjDR7 CSV Export

A Python script that imports `ZooSpec` and `PhotoObjDR7` from SciServer CasJobs, joins them in the `DR19` context, and downloads the resulting table from `MyDB` to a local CSV file in chunks.

## Overview

The script performs the following steps:

1. Prompts for SciServer credentials and authenticates using the SciServer Python API.
2. Checks whether `MyDB.ZooSpecPhoto` already contains the expected number of rows.
3. If necessary, drops the existing table and submits a SQL `JOIN` job in the `DR19` context to rebuild it.
4. Creates an index on the first column to support ordered, paginated downloads.
5. Downloads the table in chunks, appending each chunk to a CSV file while reporting progress.
6. Verifies the number of downloaded rows against the expected total.

## Requirements

- Python 3.8 or later.
- An active SciServer account with access to CasJobs.
- Permissions to query `ZooSpec` and `PhotoObjDR7` in the `DR19` context and create tables and indexes in `MyDB`.
- The SciServer Python package and its dependencies.

## Installation

Install the SciServer package in your Python environment:

```bash
pip install SciServer
```

If you use a virtual environment, activate it before installing the package and running the script.

## Usage

Save the script as `export_zoospec_photoobj.py` and run:

```bash
python export_zoospec_photoobj.py
```

When prompted, enter your SciServer username and password:

```text
SciServer username: your_username
SciServer password:
Authenticating...
Authentication successful.
```

The password is requested using Python's `getpass` module, so it is not displayed as you type. Credentials are not hard-coded in the script.

Keep the process running until the download completes.

## Configuration

The script defines the following configuration constants:

| Constant | Default | Description |
|---|---|---|
| `CONTEXT` | `DR19` | CasJobs context used to execute the source-table join. |
| `TABLE_NAME` | `ZooSpecPhoto` | Name of the destination table in `MyDB`. |
| `OUTPUT_CSV` | `ZooSpecPhoto.csv` | Local output CSV filename. |
| `CHUNK_ROWS` | `20000` | Maximum number of rows requested per download query. |
| `EXPECTED_ROWS` | `659272` | Expected total number of rows in the exported table. |

Modify these constants if you need a different output location, chunk size, or expected row count.

## Workflow

### 1. Authentication

The script authenticates using `Authentication.login()` from the SciServer Python package. If authentication fails with a `401` error, the script reports an incorrect username or password.

### 2. Building the destination table

The script checks the row count of `MyDB.ZooSpecPhoto`.

- **Expected row count found:** If the table contains exactly `659272` rows, the join is skipped.
- **Missing table, incorrect row count, or query error:** The script attempts to drop the existing table and rebuild it.

The join is executed in the `DR19` context:

```sql
SELECT ZooSpec.*, PhotoObjDR7.*
INTO MyDB.ZooSpecPhoto
FROM ZooSpec
INNER JOIN PhotoObjDR7
    ON PhotoObjDR7.dr7objid = ZooSpec.dr7objid;
```

Only records with matching `dr7objid` values in both source tables are included.

**Important:** If the existing table has a different row count, it is dropped before rebuilding. Any existing data in that table will be lost.

### 3. Preparing for download

The script identifies the first column returned by a query against `MyDB.ZooSpecPhoto` and uses it as the pagination key.

It attempts to create an index on that column to improve query performance. If index creation fails, the script logs the error and continues with the download.

### 4. Downloading in chunks

The table is downloaded using ordered SQL queries, each requesting up to `CHUNK_ROWS` records. After each successful query, the resulting DataFrame is appended to the CSV file.

The script:

- Writes the CSV header only for the first chunk.
- Uses the last key from the preceding chunk to fetch the next page.
- Retries failed page queries up to four times, with increasing delays.
- Prints the cumulative number of rows written and elapsed time.
- Stops when a query returns an empty result.

This approach avoids loading the entire table into memory at once.

### 5. Output validation

At completion, the script prints the number of rows written and the output filename. If the downloaded row count differs from `EXPECTED_ROWS`, it prints a warning.

## Output

The default output file is:

```text
ZooSpecPhoto.csv
```

The CSV contains the columns returned by `ZooSpec.*` and `PhotoObjDR7.*` in the joined table. It is written to the current working directory unless `OUTPUT_CSV` specifies another path.

Example progress output:

```text
Authenticating...
Authentication successful.
Cleaning MyDB.Zoo