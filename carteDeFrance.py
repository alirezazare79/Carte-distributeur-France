import geopandas as gpd
import matplotlib.pyplot as plt

gdf = gpd.read_file('regions.geojson')

fig, ax = plt.subplots(figsize=(10, 10))
gdf.plot(ax=ax, color='lightblue', edgecolor='black', linewidth=1)

fig.patch.set_facecolor('lightgrey')  
ax.set_facecolor('lightgrey')         

ax.set_title('Map of France by Region')
ax.set_axis_off()

plt.show()
