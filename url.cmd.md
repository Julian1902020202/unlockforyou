cd unlock4u
git add .
git commit -m "12345"
git push origin master
git push heroku master
heroku run rake db:migrate