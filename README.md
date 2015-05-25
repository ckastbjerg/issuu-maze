# issuu maze

## Installation

Try it here: https://issuu-maze.herokuapp.com/


## Installation

	npm install


## Usage

	node app.js


## Build

Builds are stupid...


## Todo

Hackday goals:
- [x] Deploy on heroku
- [x] Add dropdown with example layouts for the maze
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
- [x] Improove rotation (currently walls gets in the way)
- [x] Don't allow walking through walls
- [x] Improove wall generation algorithm (in some scenarios walls colide)
- [x] Add arms/gun/something like in a FPS (oh yeah!)
- [x] Make it possible to use a specific users documents for maze generation
- [x] Limit amount of pages that can be read and the refer to issuu
- [ ] Refactor!!!
- [ ] Update url with search params to allow sharing of maze's
- [ ] Make it possible to use stacks for maze generation (is this possible?)
- [ ] Wait for move before allowing next move (when using arrow keys)
- [ ] Make it possible to slide left and right by holding shift + left/right
- [ ] Create overlay when hovering document cover to display some metadata
- [ ] Add prefixing
- [ ] Only render visible documents to screen
- [ ] Use transform: translate instead of position for page flip animation
- [ ] Create option to configure maze layout runtime (a map editor)
- [ ] Create option to configure start position in maze
- [ ] cue up clicks for reader to enhance experience...
- [ ] Use web sockets to create a "multiplayer" experience
- [ ] Add some kind of gamification (maze quests, puzzles, etc.)
