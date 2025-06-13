Here's a polished and professional version of your README, tailored to reflect the depth of your master project. I’ve incorporated relevant context from your uploaded report as well:

---

# Parametrized Procedural Terrain Generation

This repository contains the source code for a master’s thesis project focused on the development of a modular, extensible, and interactive terrain generation tool. The tool leverages modern procedural generation techniques and exposes a RESTful API for programmatic use, while providing a web-based frontend for visualizing and manipulating the terrain.

---

## Overview

This tool facilitates terrain generation using various algorithms (e.g., Diamond-Square, Perlin noise) and supports optional post-processing via hydraulic erosion. Users can adjust parameters dynamically and visualize terrain in 3D via WebGL2. All components are containerized using Docker to simplify deployment and ensure reproducibility.

---

## System Architecture

The project is structured as a multi-container application managed via Docker Compose. The primary components include:

* **Frontend**: WebGL-based terrain viewer and user interface.
* **Backend**: Python Flask API for terrain generation and processing.
* **Database**: MongoDB for caching and storing terrain data.

![image](https://github.com/user-attachments/assets/5398961b-7458-43c4-8fe9-e1d558de9d60)


---

## Workflow Example

The diagram below illustrates the initialization sequence and interactions among containers during a typical terrain generation request:

![image](https://github.com/user-attachments/assets/76a8039e-fa52-4ecb-8d62-9eedabb76f59)


---

## Requirements

To run the application locally, you need:

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)

---

## Running the Application

From the root directory of the project:

```bash
docker compose up --build
```

Once the containers are running, access the application at [http://localhost:3000/](http://localhost:3000/)

To stop the services:

```bash
docker compose down
```

---

## Troubleshooting

If you experience issues, try the following steps:

1. Clear browser cache and local storage.
2. Run `docker compose down -v` to remove volumes.
3. Delete files in the `/mongodb_data` folder.
4. Remove dangling Docker containers:

   ```bash
   docker ps  # list running containers
   docker rm <container_name>
   ```

---

## Updating Dependencies

After modifying Dockerfiles or `docker-compose.yml`, or if dependencies change, rebuild using:

```bash
docker compose up --build
```

---

## API Reference

The backend exposes a set of endpoints for terrain-related operations:

| Endpoint                | Method | Parameters                               | Description                              |
| ----------------------- | ------ | ---------------------------------------- | ---------------------------------------- |
| `/available_algorithms` | GET    | –                                        | List of supported terrain algorithms     |
| `/erosion_parameters`   | GET    | –                                        | Parameters for hydraulic erosion         |
| `/generate_terrain`     | POST   | JSON payload                             | Generate and optionally erode terrain    |
| `/downsample_terrain`   | GET    | `hashedParams`, `targetSize`             | Return a downsampled terrain             |
| `/store_terrain`        | POST   | `hashedParams`, `terrainData`            | Store a custom terrain                   |
| `/retrieve_terrain`     | GET    | `hashedParams`                           | Retrieve terrain from cache              |
| `/webgl_arrays`         | POST   | `hashedParams`, `whichArraysFromBackend` | Generate data arrays for WebGL rendering |

---

## Acknowledgements

This project builds upon the work of many talented developers and researchers:

* WebGL height map integration:
  [https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-import-a-heightmap-in-webgl.html](https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-import-a-heightmap-in-webgl.html)
* Noise-based terrain tutorials:
  [https://www.redblobgames.com/maps/terrain-from-noise/](https://www.redblobgames.com/maps/terrain-from-noise/)
* Python mesh generation base code:
  [https://loady.one/blog/terrain\_mesh.html](https://loady.one/blog/terrain_mesh.html)
* Hydraulic erosion logic based on Sebastian Lague’s C# implementation:
  [https://github.com/SebLague/Hydraulic-Erosion](https://github.com/SebLague/Hydraulic-Erosion)

We are grateful for the open-source contributions and educational content that made this project possible.

---

Let me know if you want a shorter version for a GitHub repo summary or a section for contributions, licensing, or citations.
