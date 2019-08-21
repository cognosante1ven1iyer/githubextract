This nodejs program uses octokit REST api to pull Projects and Issues information from GitHub.

Authentication
==============

The program expects a config file located at ```~/.githubextract.config```
```
MacBook-Pro:githubextract viyer$ ls ~/.gitHubExtract.config 
/Users/viyer/.gitHubExtract.config
```
The contents of the file are as such
```
username=cognosante1ven1iyer
password=*************
token=************************
projectID=*****
```

(Note you can setup any GitHub account of your own for trying this program)

Setup
=====

In order to run the program, start the setup as such

Clone the repo
```
$ git clone https://github.com/cognosante1ven1iyer/githubextract.git
```
Go to the directory with the code
```
$ cd githubextract
```
Install the npm libraries
```
$ npm i
```
Run the program
===============
```
$ node githubextract.js
```
Output
======

The program produces one file in the working directory
```
project_extract.csv
-Contains the projects information with notes and incidents combined in one file
````
