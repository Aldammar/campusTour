# CamusTour Documentation

## Installation

Zurzeit wird die CampusTour über GitHub Pages gehostet. Erreichbar ist diese unter folgendem
Link: [CampusTour](https://aldammar.github.io/campusTour/)

Wenn man die CampusTour verändert will oder sie unter einem eigenen Link hosten will, dann gibt es verschiedene
Möglichkeiten:

### GitHub Pages

Hier kann man sowohl einen eigenen Link verwenden (oder den bestehenden) als auch die CampusTour verwenden.
Folgende Schritte sind notwendig:

1. **Repository forken**: Entweder direkt auf [GitHub](https://github.com/Aldammar/campusTour/fork), über die GitHub
   Desktop App oder über die GitHub CLI. Weitere Informationen dazu gibt
   es [hier](https://docs.github.com/de/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo).
2. **Repository klonen**: Das geforkte Repository kann nun geklont werden. Dies muss nicht gemacht werden, wenn die
   GitHub Desktop App oder die GitHub CLI mit `--clone=true` verwendet wurde. Zum Klonen kann man entweder
   die [GitHub Desktop App](https://docs.github.com/de/repositories/creating-and-managing-repositories/cloning-a-repository?tool=desktop),
   die [GitHub CLI](https://docs.github.com/de/repositories/creating-and-managing-repositories/cloning-a-repository?tool=cli)
   oder mit der Git Bash machen. Für die Git Bash wird der folgende Befehl benötigt:
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
    ```
3. **Änderungen vornehmen**: Nun können Änderungen an der CampusTour vorgenommen werden. Hierfür kann man die
   im [How-To](How-to-simple-change.md) beschriebenen Schritte verwenden. Wenn man mehr als die
   im [How-To](How-to-simple-change.md) beschriebenen Sachen ändern will, dann kann man sich an
   die [Referenz](Reference.md) wenden.
4. **Änderungen hochladen**: Nachdem die Änderungen vorgenommen wurden, muss man diese committen und pushen, damit sie
   auch von GitHub erkannt werden.
5. **GitHub Pages aktivieren**: In den Repository-Einstellungen unter dem Tab "Pages" kann die GitHub Pages aktiviert
   werden. Hierbei muss man noch auswählen, von welchem Branch die GitHub Pages erstellt werden sollen. Standardmäßig
   ist dies der `main`-Branch im obersten Ordner. Mehr hierzu gibt es auf
   der [GitHub Pages Seite](https://pages.github.com/).
6. **Fertig**: Nun sollte die CampusTour unter `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` erreichbar sein.

### Eigene Domain

Hier kann man alles so machen, wie bei den GitHub Pages, es ist aber etwas komplizierter, wenn man die Seite einfach nur
hosten will.

Man benötigt für diese Methode einen HTTPS-Server. Dieser kann entweder selbst aufgesetzt werden oder gemietet werden.

1. **Server überprüfen**: Der Server muss HTTPS und JavaScript unterstützen. Die meisten Server kommen mit einer
   JavaScript-Unterstützung, jedoch nicht unbedingt mit einer HTTPS-Unterstützung. Sollte SSL nicht eingerichtet sein,
   finden sich im Internet viele Anleitungen dazu.
2. **Repository auf den Server laden**: Entweder lädt man den aktuellen Zweig direkt als zip
   herunter ([GitHub](https://github.com/Aldammar/campusTour/archive/refs/heads/master.zip)) und entpackt dieses auf dem
   Server oder man erstellt wie unter [GitHub Pages](#github-pages) beschrieben ein Repository und cloned dieses auf den
   Server.
3. **Server konfigurieren**: Hierbei muss man darauf achten, dass der Pfad zum Ordner des Repositories auf dem `root`
   -Pfad des Servers liegt. Man kann dann über (https://YOUR-DOMAIN/PATH-TO-REPOSITORY-FROM-ROOT) auf die CampusTour
   zugreifen. Wenn man mit (https://YOUR-DOMAIN/) auf die CampusTour zugreifen will, dann muss man den Pfad zum
   Repository als `root`-Pfad des Servers setzen. Die genaue Konfiguration kommt auf den Server an.

## Verwendung

Um die Webseite zu verwenden, benötigt man Zugriff auf die Kamera und beim ersten Laden Internet. Dann kann man die
Webseite so, wie sie ist, verwenden.