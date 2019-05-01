# Osiris_Puppeteer
This script will check osiris.hro.nl (Hogeschool Rotterdam Grading System) for new grades.


# How do I use this?
First of you need to have installed the following packages:
* puppeteer
* tabletojson
* pushover
* fs

This script will check your Enviroment Variables for your Username and Password, it's the same for the Pushover notifications. So you will need to set these. You can do this using the following commands:

#### Windows
```
set USERNAME='Hogeschool Rotterdam Username'
set PASSWORD='Hogeschool Rotterdam Password'

set PUSHUSER='Pushover User Token'
set PUSHTOKEN='Pushover Application Token'
```
