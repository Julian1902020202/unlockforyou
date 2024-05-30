setlocal EnableDelayedExpansion

rem Generiere eine zufällige 12-stellige Zeichenfolge
set "charset=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
set "randomString="
for /L %%i in (1,1,12) do (
    set /A "randNum=!random! %% 62"
    for %%j in (!randNum!) do set "randomChar=!charset:~%%j,1!"
    set "randomString=!randomString!!randomChar!"
)

rem Git-Befehle mit der generierten Zeichenfolge
git add .
git commit -m "!randomString!"
git push origin master
git push heroku master

endlocal

 