# Hitpoints

A recipe manager web app.
- Add, edit, and tag recipes
- Add links to recipe ingredients inside recipe instructions
- Search recipes
- Import recipes from other websites
- Real time updates between devices
- Works offline

## Demo

https://josh18.github.io/hitpoints/recipes

Contains 5000 recipes that were extracted from [this dataset](https://github.com/Glorf/recipenlg). The import process isn't perfect so the recipes aren't as tidy as they could be and unfortunately there are no images.

_Note that the demo doesn't have a server running so it doesn't support syncing between devices, uploading images, or importing from other websites._

## How to use it

This project is currently designed for myself to use so it could do with some improvements to make it more flexible. If you do want to use it, let me know and I'll see what I can do to help.

Currently I deploy it to Google Cloud using Cloud Run (server), Cloud Firestore (storing data), and Cloud Storage (storing events). It also works with SQLite and a local filesystem if you want to self host it

I haven't spent a lot of time on accessibility, if you do want to use this and are having issues with it please let me know and I'll do my best to improve things.

## Architecture

Client built with React, server in Node using Nest, and a separate module for sharing code and types between the two. It uses a form of event sourcing to sync and store data.

The client creates events based on user actions that it dispatches to Redux to update state and also stores the event in [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). When online it syncs these events with the server so that they can be shared with other devices. The client also builds materialised views (e.g. a recipe) from the events which it stores into IndexedDB. It also maintains a token based search index using [Lunr.js](https://github.com/olivernn/lunr.js/) to provide search functionality which works even when offline.

The server handles syncing events between clients, validating events, storing events and images, and importing recipes from other websites.

## Why I made it
- Mostly for fun as I wanted to experiment with new technologies and techniques.
- I can create a personal catalog of online recipes instead of spending an eternity trying to remember which recipe I used last time.
- The import feature is useful for concentrating recipes from websites that contain a lot of extra (blog like) information. It also allows you to make alterations to the recipe.
- I had a lot of loose recipes lying around that I wanted to get rid of.

## What I learnt
- Finishing a personal project is really hard. Probably because I put off doing the tricky / boring stuff until the end. It's not perfect and there are some things I'd like to add in the future but I'm glad I got it into a usable state before moving on to my next project.
- Changing architecture and technologies is a lot of fun but takes up a lot of time. The current structure of this project is completely different from when I started. I learnt a lot of different things along the way though so no regrets.
- The pattern of combining event sourcing with client state management (redux) seems pretty easy to build on once implemented and allows you to easily add offline support. There's potential for a few types of scaling issues but it seems pretty useful in small projects and I'll definitely try it again in future projects.
