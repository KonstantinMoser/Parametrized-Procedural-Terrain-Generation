# Parametrized Procedural Terrain Generation

This repository contains the source code for a master’s project focused on the development of a modular, extensible, and interactive terrain generation tool. The tool leverages modern procedural generation techniques and exposes a RESTful API for programmatic use, while providing a web-based frontend for visualizing and manipulating the terrain.

This project was developed by Christian Skorski, Kalliopi Papadaki, and Konstantin Moser as part of our master at the University of Zurich.

![image](https://github.com/user-attachments/assets/cd70935c-a71c-4789-8c2d-4bbe83b306d8)
![image](https://github.com/user-attachments/assets/7930f793-2c35-46b5-9013-cb919833ce69)



## Note on Repository Scope
This repository currently includes only the frontend component of the project. The backend, which contains the core terrain generation logic and API implementation, has not been made public due to uncertainty around distribution rights and potential intellectual property restrictions.

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

The project wouldn't have been as successful or at all possible without the following external resources:

* WebGL height map integration:
  [https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-import-a-heightmap-in-webgl.html](https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-import-a-heightmap-in-webgl.html)
* Noise-based terrain tutorials:
  [https://www.redblobgames.com/maps/terrain-from-noise/](https://www.redblobgames.com/maps/terrain-from-noise/)
* Python mesh generation base code:
  [https://loady.one/blog/terrain\_mesh.html](https://loady.one/blog/terrain_mesh.html)
* Hydraulic erosion logic based on Sebastian Lague’s C# implementation:
  [https://github.com/SebLague/Hydraulic-Erosion](https://github.com/SebLague/Hydraulic-Erosion)

We are grateful for the open-source contributions and educational content that made this project possible.
