# d5n

The files in this folder are used to help me mix ConvNetJS, Node.js, CoffeeScript, and deep500.

If you have questions, e-me: bikle101@gmail.com

If you want to run this software, I suggest that you setup a dev-env which is like mine.

I do development on Ubuntu 14 which can be run as a guest OS on a Mac using VirtualBox, VMware, or parallels.

You can get a copy of Ubuntu 14 here:

http://releases.ubuntu.com/14.04/ubuntu-14.04.3-desktop-amd64.iso


I like to install a wide variety of software on my Ubuntu host.  Some of the software listed below is probably not necessary but I like to have it available.

```
sudo apt-get update
sudo apt-get upgrade

sudo apt-get install autoconf bison build-essential libssl-dev libyaml-dev \
libreadline6-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm3       \
libgdbm-dev libsqlite3-dev gitk postgresql postgresql-server-dev-all  \
libpq-dev emacs wget curl chromium-browser openssh-server aptitude    \
ruby ruby-dev sqlite3

sudo apt-get update
sudo apt-get upgrade
```

Next I install Node.js:

```
cd ~
rm -rf node 
wget https://nodejs.org/dist/v5.3.0/node-v5.3.0-linux-x64.tar.gz
tar zxf node-v5.3.0-linux-x64.tar.gz
mv node-v5.3.0-linux-x64 node

export       PATH="${HOME}/node/bin:${PATH}"
echo 'export PATH="${HOME}/node/bin:${PATH}"' >> ~/.bashrc

which npm
npm install -g coffee-script
which coffee
coffee -e 'console.log "hello coffee!"'
```
