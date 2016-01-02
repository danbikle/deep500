# n13.coffee

# This script should help me run ConvNetjS.
# Demo:
# coffee n13.coffee

convnetjs = require("./convnetjs.js")

magicNet = new convnetjs.MagicNet()

# This function wraps console.log() inside of clog().
clog = (in_x) ->
  console.log in_x

clog magicNet

# end
