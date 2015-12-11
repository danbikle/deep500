# Deep500

This repo contains some demos which I wrote to connect my mind to the convnet.js API.

To get started I logged into my Ubuntu virtualbox.

This repo depends on Meteor so I installed it:

```bash
cd ~
curl https://install.meteor.com/ | sh
echo 'export PATH=${HOME}/.meteor:$PATH' >> ~/.bashrc
bash
```

Next I ensured that my Ubuntu host had both curl and git:

```bash
sudo apt-get curl gitk
```

Then I cloned the deep500 repo:

```bash
cd ~
git clone https://github.com/danbikle/deep500
```

Then I started the Meteor server:

```bash
cd ~/deep500
git checkout -b mybranch
~/.meteor/meteor
```
I  browsed this page:

http://localhost:3000/

I saw a page which was mostly empty.

I created an account via the signup link.

Then I logged in and created a model.

Next, I clicked the 'chart em' button to see what I call the blue-green visualization.

That, ends the demo of this repo.
