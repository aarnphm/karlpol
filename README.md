<h2 align="center">karlpol</h2>
<p align="center"><i>minimal privacy-focused carpool planner</i></p>

## Updates
<h3 align="center">Maps API has been expired. I will work further to improve security and features. Stay tuned</h3>
## Inspiration
The high quality of life in Greater Toronto and Hamilton Area, as well as the competitiveness of the region's industrial base have brought congestion along with its economic growth. Indeed it wouldn't be economic sensible to have a transportation infrastructure operating at zero congestion 24/7. Yet, there are certain level of congestion where its attendant costs (stuck in traffic, diminished productivity,  etc) would surpass the benefits and threat the region's viability as a decent living spaces. According to Metrolinx, there are currently more than two million automobile trips are made during the peak travel period each morning in GTHA, which is shown to have cost us $2.7 billions in economic growth annually. Additionally, traffic congestion increases vehicle emissions and degrades ambient air quality, and recent studies shows excess morbidity and mortality for drivers, commuters living near major roadways. So I want to develop a system that can both allows people to join/hop on a ride that can also acts as a planner.

## What it does
At the moment, It allows users to plan a group together, figuring our how to get friends, those without access to a car. Sometimes planning can be a hassle. With karlpol you can work out a schedule/itinerary that will make no drivers to go back and forth, minimize on time loss. karlpol doesn't collect any personal data so that is also a plus in this day and ages. Submitted at [DeltaHacks 7](https://deltahacks7.devpost.com/)

## How I built it
Using Google Maps API and Radar API, with some math =)) karlpol will create the a schedule that is optimal, time-efficient. The app is built on React, Typescript, Firebase, Node.js with the API mentioned above, with a design system from Material UI, which is inspired by Uber. Karlpol is also designed to be lightweight, easy to deploy (automated through github actions), and minimal.

## Challenges we ran into
At first thought the idea for the algorithm that find the best schedule for carpool problem is intimidating at least, and after some [research](https://arxiv.org/abs/1604.05609) it turns out to be a NP-hard problem. I didn't solve the problem perfectly, but were able to design a algorithm to compute it. This is also my first time working with React, so I ran in a lot of trouble getting up to speed with the framework, as well as create a design for the application that looks minimal

## Accomplishments that we're proud of
Being able to get a basic functionality of the web application with a completely new framework.
It is also the first time I hack a project entirely in Typescripts, from handling login forms, authentication to database logics.

## What we learned
Learn about React and building UX/UI interfaces. I also learned a lot about geocoding and programming theory. I also learned that to see the problems in different ways that is not necessarily involve machine learning as the answer.  (even though machine learning algorithm are getting better every minute, and they are cool problem infrastructure-wise (scalability, deployment, etc)). I also learn to not overthink a problem (at first when I developed backend it involved graphql, apollo, mariaDB, and more,  a full on microservice infrastructure for a hackathon project =)))

## What's next for karlpol
I had done half of the idea, which is that karlpol is a planner system for carpooling, I want to extend where random people when login into the system they can also choose carpool schedule that are nearby and they can just request the owners to hop on. I also want karlpol to be centered around privacy, where people can just get on the system without signup and join in a nearby carpool options for transports.
