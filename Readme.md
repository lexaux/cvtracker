# CV Tracker

This is a very little application in node and javascript/html (jQuery), utilizing MongoDB, to be deployed to Heroku.
This app does one simple thing - helps *keep your job applications organized* by adding a trackability to the CV
downloads.

For each job application, app creates a unique (uuid-backed) link, which is to be shared to this application only.
As the link is shared, every download counts - and basically you know when someone has requested your CV and who is
that someone (or, at least, what job application do the relate to).