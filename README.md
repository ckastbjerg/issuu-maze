# issuu maze

## Installation

	npm install


## Usage

	node app.js


## Build

Builds are stupid...


## Todo

Hackday goals:
- [ ] Deploy on heroku
- [ ] cue up clicks for reader to enhance experience...
- [ ] Add dropdown with example layouts for the maze
- [x] Beautify code
- [x] Add takana
- [x] Create custom 3d reader (load individual pages when document cover is clicked)
- [x] Allow multiple searches (without reloading)
- [x] Have documents transition in when search is performed (like in "The Matrix" weapon scene!)
- [x] Fix covers/pages being inverted
- [x] Add dropdown for selecting by interests (Mortens data)
    example:
    http://api.issuu.com/call/interests/list?lang=en
    http://api.issuu.com/call/stream/api/iosinterest/1/0/initial?interestIds=105&seed=42&pageSize=10


Nice to have:
- [ ] Create overlay when hovering document cover to display some metadata
- [ ] Add prefixing
- [ ] Improove rotation (currently walls gets in the way)
- [ ] Don't allow walking through walls
- [ ] Only render visible documents to screen
- [ ] Create option to configure maze layout runtime (a map editor)
- [ ] Improove wall generation algorithm (in some scenarios walls colide)
- [ ] Add arms/gun/something like in a FPS (oh yeah!)
