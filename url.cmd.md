cd /path/to/your/app
git add .
git commit -m "Beschreibung der Änderungen"
git push origin master 
git push heroku master
heroku run rake db:migrate 


