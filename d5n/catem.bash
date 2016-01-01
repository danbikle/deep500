#!/bin/bash

# This script should cat ConvNetJS files into ./convnetjs.js in the order specified by this file:
# https://github.com/karpathy/convnetjs/blob/master/compile/build.xml

cat src/convnet_init.js                   > convnetjs.js 
cat src/convnet_util.js                  >> convnetjs.js 
cat src/convnet_vol.js			 >> convnetjs.js 
cat src/convnet_vol_util.js		 >> convnetjs.js 
cat src/convnet_layers_dotproducts.js	 >> convnetjs.js 
cat src/convnet_layers_pool.js		 >> convnetjs.js 
cat src/convnet_layers_input.js		 >> convnetjs.js 
cat src/convnet_layers_loss.js		 >> convnetjs.js 
cat src/convnet_layers_nonlinearities.js >> convnetjs.js 
cat src/convnet_layers_dropout.js	 >> convnetjs.js 
cat src/convnet_layers_normalization.js	 >> convnetjs.js 
cat src/convnet_net.js			 >> convnetjs.js 
cat src/convnet_trainers.js		 >> convnetjs.js 
cat src/convnet_magicnet.js		 >> convnetjs.js 
cat src/convnet_export.js		 >> convnetjs.js 
exit
