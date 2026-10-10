"""
Module to clean and preprocess the ZooSpec data.
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

MIN_VOTES = 20

CLASS_NAMES = {0: "uncertain", 1: "spiral", 2: "elliptical"}
CLASS_COLORS = {0: "tab:gray", 1: "tab:blue", 2: "tab:red"}
ID_COLS = {"specobjid": str, "objid": str, "dr7objid": str, "dr8objid": str}


def clean_data(dataframe):
    """Clean the ZooSpecPhoto data and save to CSV."""
    # Drop rows missing key fields (also removes truncated rows) and duplicates.
    df = dataframe.dropna(subset=["ra", "dec", "petroMag_r", "spiral", "elliptical"])
    df = dataframe.drop_duplicates(subset="objid").copy()

    # Labels: 0 = uncertain, 1 = spiral, 2 = elliptical (kept for splitting/evaluation).
    df["label"] = (df["spiral"] * 1 + df["elliptical"] * 2).astype(int)
    df = df[df["label"].isin([0, 1, 2])].copy()

    # Only keep galaxies with enough votes for reliable labels.
    df = df[df["nvote"] >= MIN_VOTES].copy()
    print(f"Galaxies after vote filter: {len(df)}")

    # Remove nonsensical magnitudes (e.g. -9999) and infs.
    mag_cols = [c for c in df.columns
            if c.startswith(("psfMag_", "petroMag_", "modelMag_")) and "Err" not in c]
    df[mag_cols] = df[mag_cols].where((df[mag_cols] > 5) & (df[mag_cols] < 35))
    df = df.replace([np.inf, -np.inf], np.nan).dropna(subset=mag_cols)

    # Quality cuts on photometry and size.
    df = df[(df["modelMagErr_r"] < 0.2) & (df["petroR50_r"] > 0) & (df["petroR90_r"] > 0)].copy()

    # Soft score: 0 = spiral, 1 = elliptical, ~0.5 = voters split.
    # Must be computed BEFORE the vote-fraction columns are dropped below.
    total = df["p_el_debiased"] + df["p_cs_debiased"]
    df = df[total > 0].copy()
    df["score"] = df["p_el_debiased"] / (df["p_el_debiased"] + df["p_cs_debiased"])

    # Drop non-feature columns: IDs, bookkeeping, and leakage from Galaxy Zoo votes.
    # Keeps objid, ra, dec (needed to fetch images), nvote and p_dk (for sample weights),
    # label (for stratified splits) and score (the target).
    drop_cols = ["Column1", "Column2", "Column3", "Column4", "dr7objid", "dr8objid",
                "htmID", "fieldID", "rastring", "decstring", "run", "rerun", "camcol",
                "field", "obj", "skyVersion", "modeDR7", "modeDR8", "nChild", "status",
                "primTarget", "secTarget", "insideMask", "distance", "cx", "cy", "cz",
                "flags", "type", "probPSF", "spiral", "elliptical", "uncertain",
                "p_el", "p_cw", "p_acw", "p_edge", "p_mg", "p_cs",
                "p_el_debiased", "p_cs_debiased"]
    df = df.drop(columns=[c for c in drop_cols if c in df.columns]).reset_index(drop=True)

    print(df["label"].value_counts().sort_index())
    print(df["score"].describe())

    df.to_csv("ZooSpecPhoto_Clean.csv", index=False)
    return df


def plot_label_distributions(dataframe, bins=50, save_path=None):
    """Plot class counts and the soft-score distribution (overall and per class)."""
    _, axes = plt.subplots(1, 3, figsize=(17, 4.5))

    # 1. Class counts, with percentages on the bars
    counts = dataframe["label"].value_counts().sort_index()
    bars = axes[0].bar([CLASS_NAMES[i] for i in counts.index], counts.values,
                       color=[CLASS_COLORS[i] for i in counts.index])
    for bar, n in zip(bars, counts.values):
        axes[0].text(bar.get_x() + bar.get_width() / 2, n,
                     f"{n:,}\n({n / counts.sum():.1%})",
                     ha="center", va="bottom", fontsize=9)
    axes[0].set_title("Class counts")
    axes[0].set_ylabel("Galaxies")
    axes[0].set_ylim(0, counts.max() * 1.18)

    # 2. Overall score distribution
    axes[1].hist(dataframe["score"], bins=bins, range=(0, 1), color="tab:green", alpha=0.8)
    axes[1].set_title("Score distribution (all galaxies)")
    axes[1].set_xlabel("score  (0 = spiral, 1 = elliptical)")
    axes[1].set_ylabel("Galaxies")

    # 3. Score per class, density-normalised so the small classes stay visible
    for label, name in CLASS_NAMES.items():
        sub = dataframe.loc[dataframe["label"] == label, "score"]
        axes[2].hist(sub, bins=bins, range=(0, 1), density=True, alpha=0.5,
                     color=CLASS_COLORS[label], label=f"{name} (n={len(sub):,})")
    axes[2].set_title("Score per class (normalised)")
    axes[2].set_xlabel("score  (0 = spiral, 1 = elliptical)")
    axes[2].set_ylabel("Density")
    axes[2].legend()

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=150)
    plt.show()

if __name__ == "__main__":
    ID_COLS = {"specobjid": str, "objid": str, "dr7objid": str, "dr8objid": str}
    df = pd.read_csv("ZooSpecPhoto.csv", dtype=ID_COLS)
    clean_df = clean_data(df)
    plot_label_distributions(clean_df, save_path="label_distributions.png")
