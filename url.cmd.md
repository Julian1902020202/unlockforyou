cd /path/to/your/app
git add .
git commit -m "Beschreibung der Änderungen"
git push origin master # Optional, nur wenn du GitHub verwendest
git push heroku master
heroku run rake db:migrate # Optional, falls Datenbankmigrationen notwendig sind


