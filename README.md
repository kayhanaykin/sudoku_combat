_This project has been created as part
of the 42 curriculum by kaykin, ekarau, apalaz, yunozdem._


## [Jump to Installation](#installation-of-the-project)

# Final Project of 42
![Final Grade](https://img.shields.io/badge/Grade-100%20%2F%20100-success?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/42-Project-black?style=for-the-badge)

This is the final group project of [42 Programming School](https://en.wikipedia.org/wiki/42_(school)), called ft_transendence. It has been successfully completed by 4 teammate software developers, namely, [Mr. Ege Karaurgan](https://tr.linkedin.com/in/ege-karaurgan-389818258), [Mr. Ali Eren Palaz](https://tr.linkedin.com/in/ali-eren-palaz-23ba3a28a), [Mr. Kayhan Aykın](https://tr.linkedin.com/in/kayhan-aykin-48922a51), Mr. Yunus Emre Özdem.

The project has been done according to ft_transendence subject document version 19 and evaluated with evaluation page that is available during evaluation. 

The project has been planned to be submitted about March of 2026. It has been done by students of and at the campus of [42 Istanbul](https://42istanbul.com.tr/).

In order to successfully finish the project, mandatory parts and at least 14 points of modules should be done.

As this is a long group project, proper team organization is crucial for success.

# Team Organization and Project Management

Our team organization is given below with details.

We have planned weekly cluster meeting and bi-weekly online meetings.

For team communication a simple <font color="orange">**whatsapp**</font> group is used. For storing/version controlling we have used <font color="orange">__Github__</font>. 

## Product Owner (PO), Mr. Ege Karaurgan, Mr. Ali Eren Palaz
Defines the product vision, prioritizes features, and ensures the project meets user needs.
<ul>
<li>Maintains the product backlog.</li>
<li>Makes decisions on features and priorities.</li>
<li>Validates completed work.</li>
<li>Communicates with developers.</li>
</ul>

## Project Manager (PM) / Scrum Master, Mr. Yunus Emre Özdemir, Mr. Ali Eren Palaz
Facilitates team coordination and removes obstacles.
<ul>
<li>Organizes team meetings and planning sessions.</li>
<li>Tracks progress and deadlines.</li>
<li>Ensures team communication.</li>
<li>Manages risks and blockers.</li>
</ul>

## Technical Lead / Architect, Mr. Kayhan Aykın
Oversees technical decisions and architecture.
<ul>
<li>Defines technical architecture.</li>
<li>Makes technology stack decisions.</li>
<li>Ensures code quality and best practices.</li>
<li>Reviews critical code changes</li>
</ul>

## Developers (all team members):
Implement features and modules.
<ul>
<li>Write code for assigned features.</li>
<li>Participate in code reviews.</li>
<li>Test their implementations.</li>
<li>Document their work.</li>
</ul> 

# Chosen Modules
## Use a Frontend Framework (React, 1pt)
<ul>
<li>DOM ensures highly efficient updates and rendering, which provides the smooth and responsive user experience necessary for a real-time multiplayer game</li>
<li>React's extensive ecosystem easily integrates with Django</li>
</ul>

## Use a Backend Framework (Django, NestJS, 1pt)
<ul>
<li> Batteries-included framework enables the rapid development of essential backend components like user authentication 
</li>
<li>Django Channels to provide the powerful, built-in WebSocket support</li>
</ul>

## Implement Real-time features using Websockets (2pts)

<ul>
<li>online status feature
</li>
<li>online game</li>
</ul>

## Use an ORM for the Database (1pt)

<ul>
<li>Room, Combat & User microservices have its own database with ORM. </li>
</ul>

## Reusable components ??

## Support for Additional Browsers (1pt)

<ul>
<li>4Web application is checked with Google Chrome and Firefox. </li>
</ul>

## Standart User Management and Authentication (2pts)

<ul>
<li>Users can update their profile information.
</li>
<li>Users can upload an avatar</li>
<li>Users can add other users as friends and see their online status.
</li>
<li>Users have a profile page displaying their information</li>
</ul>

## Game Statistics and Match History (1pt)

<ul>
<li>Track user game statistics (wins, losses, etc.)</li>
<li>Display match history (1v1 games, dates, results, opponents)</li>
<li>Show achievements and progression.</li>
<li>Leaderboard integration</li>
</ul>

## Implement Remote Authentication with OAuth 2.0 (1pt)

<ul>
<li>42 Intra login option. </li>
</ul>

## Implement a complete web-based game (2pts)

<ul>
<li>The game is a real-time multiplayer game.</li>
<li>Single & Combat playing options.</li>
<li>Game rules page demonstrates clear rules.</li>
</ul>

## Remote players (2pts)

<ul>
<li>Handle connection & disconnection with smooth UX for remote gameplay</li>
<li>Implement reconnection logic</li>
</ul>

## A Gamification System (1pt)

<ul>
<li>Achievements, badges, leaderboards are implemented </li>
<li>Data is stored in microservice database</li>
<li>Game progress bars implemented.</li>
<li>Every achicement and badge have clear explaination.</li>
</ul>

## Backend as Microservices (2pts)

<ul>
<li>Web app is split into five different microservices.</li>
<li>Microservices are commmunicating with JSON messeages</li>
<li>The tasks of the web application are divided into, ser service, combat service, room service, statistics service, game service.</li>
</ul>

# Programming Languages, Frameworks and Tools Used
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![Crow](https://img.shields.io/badge/Crow-%23222222.svg?style=for-the-badge&logo=crow&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)


![42](https://img.shields.io/badge/42-000000?style=for-the-badge&logo=42&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

# Database Schema
## Overview

The Sudoku Combat application uses a microservices architecture with multiple databases:

- **Game Service**: No database
- **User Service**: PostgreSQL (Django ORM) - User accounts, authentication, profiles, friends
- **Room Service**: TypeORM with PostgreSQL - Game rooms and multiplayer sessions
- **Combat Service**: No database
- **Stats Service**: TypeORM with PostgreSQL - game stats and badges data, leaderboard

# Installation of the Project
## 1<sup>st</sup> Step - Docker Engine
This project works in a docker container. Therefore, docker engine has to be installed on your host. Check whether docker engine has been installed by the code below.

```bash
docker --version
```
 If u see a version, it has benn installed. If not please follow the [docker engine installation link](https://docs.docker.com/engine/install/) for installation.

 ## 2<sup>nd</sup> Step - Environment
 For security purposes, .env file has not been pushed to remote repo. There is a .env.example file that has some generic key values for testing purposes. Please change the name of the file to **".env"** from **"env.example"**.

## 3<sup>rd</sup> Step - Build
 Just make from root of your repo.

 ```bash
make
```

## 4<sup>th</sup> Step - Browse
Everything is ready. 

Reach site from any browser, using, [https://ekay.42.fr](https://ekay.42.fr).

# Resources
## Markdown
<ul>
  <li><i><a href="https://en.wikipedia.org/wiki/Markdown">Markdown - Wikipedia</a></i></li>
  <li><i><a href="https://www.makeareadme.com/">Make a README</a></i></li>
</ul>

## Git
<ul>
  <li><i><a href="https://www.youtube.com/watch?v=Q8WTlLf8pBo">How Teams Use Git Branches to Build Features - Youtube Video</a></i></li>
  <li><i><a href="https://www.makeareadme.com/">https://www.makeareadme.com/</a></i></li>
</ul>

## AI Usage
### Game Engine
<ul>
<li>Suggested the best programming language as C++.
<li>Informed about the independence of three diagonal boxes.
<li>Symantics of backtracking algorithm.  
</ul>

