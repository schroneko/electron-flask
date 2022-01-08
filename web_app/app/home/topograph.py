import matplotlib.pyplot as plt
import numpy as np
import scipy.interpolate
from matplotlib import patches
from matplotlib.colors import Normalize
from scipy import signal


def get_psds_theta(data, fs=250, f_range=[4, 8]):
    powers = []
    psds = list()
    for sig in data:
        freq, psd = signal.welch(sig, fs)
        idx = np.logical_and(freq >= f_range[0], freq <= f_range[1])
        powers = np.append(powers, sum(psd[idx]))
        psds.append(psd[idx])

    return powers, psds


def get_psds_alpha(data, fs=250, f_range=[8, 12]):
    powers = []
    psds = list()
    for sig in data:
        freq, psd = signal.welch(sig, fs)
        idx = np.logical_and(freq >= f_range[0], freq <= f_range[1])
        powers = np.append(powers, sum(psd[idx]))
        psds.append(psd[idx])

    return powers, psds


def get_psds_beta(data, fs=250, f_range=[12, 30]):
    powers = []
    psds = list()
    for sig in data:
        freq, psd = signal.welch(sig, fs)
        idx = np.logical_and(freq >= f_range[0], freq <= f_range[1])
        powers = np.append(powers, sum(psd[idx]))
        psds.append(psd[idx])

    return powers, psds


def plot_topomap(data, ax, fig, draw_cbar=True):
    N = 300
    xy_center = [2, 2]
    radius = 2

    # 下記がその順番
    # 'Fp1','Fp2','C3','C4','O1','O2','T3','T4','F7','F8','T5','T6'
    # T3=T7,T4=T8,T5=P7,T6=P8
    # 全部で１６電極（重複除くと１２電極）
    ch_pos = [
        [1.5, 4.2],
        [2.5, 4.2],
        [0.95, 2],
        [3.05, 2],
        [1.5, 0],
        [2.5, 0],
        [-0.1, 2],
        [4.1, 2],
        [0.1, 3],
        [3.9, 3],
        [0.4, 0.4],
        [3.6, 0.4],
    ]
    x, y = [], []
    for i in ch_pos:
        x.append(i[0])
        y.append(i[1])

    xi = np.linspace(-2, 6, N)
    yi = np.linspace(-2, 6, N)
    zi = scipy.interpolate.griddata(
        (x, y), data, (xi[None, :], yi[:, None]), method="cubic"
    )

    dr = xi[1] - xi[0]

    # for i in range(N):
    for i in range(N):
        for j in range(N):
            rss = (xi[i] - xy_center[0]) ** 2 + (yi[j] - xy_center[1]) ** 2
            r = np.sqrt(rss)
            if (r - dr / 2) > radius:
                zi[j, i] = "nan"

    dist = ax.contourf(
        xi,
        yi,
        zi,
        60,
        cmap=plt.get_cmap("bwr"),
        zorder=1,
        norm=Normalize(vmin=-2.5, vmax=2.5),
    )
    ax.contour(xi, yi, zi, 15, linewidths=0.5, colors="grey", zorder=2)

    if draw_cbar:
        cbar = fig.colorbar(dist, ax=ax, format="%.1f")
        cbar.ax.tick_params(labelsize=8)

    ax.scatter(x, y, marker="o", c="b", s=15, zorder=3)
    circle = patches.Circle(
        xy=xy_center, radius=radius, edgecolor="k", facecolor="none", zorder=4
    )
    ax.add_patch(circle)

    for loc, spine in ax.spines.items():
        spine.set_linewidth(0)

    ax.set_xticks([])
    ax.set_yticks([])

    circle = patches.Ellipse(
        xy=[0, 2],
        width=0.4,
        height=1.0,
        angle=0,
        edgecolor="k",
        facecolor="w",
        zorder=0,
    )
    ax.add_patch(circle)
    circle = patches.Ellipse(
        xy=[4, 2],
        width=0.4,
        height=1.0,
        angle=0,
        edgecolor="k",
        facecolor="w",
        zorder=0,
    )
    ax.add_patch(circle)

    xy = [[1.6, 3.6], [2, 4.3], [2.4, 3.6]]
    polygon = patches.Polygon(xy=xy, edgecolor="k", facecolor="w", zorder=0)
    ax.add_patch(polygon)

    ax.set_xlim(-0.5, 4.5)
    ax.set_ylim(-0.5, 4.5)

    return ax
