# Markdown Cheat-Sheet
## Überschrift 2
### Überschrift 3
#### Überschrift 4

Überschriften werden mit einem oder mehreren `#` geordnet.

Ein Absatz wird mit einer Leerzeile realisiert.  
Für Zeilenumbrüche werden zwei Leerzeichen am Ende einer Zeile eingefügt.

Zeichen mit Markdown Syntax Bedeutung müssen mit einem `\` escaped werden.

`Quellcode` wird mit den Zeichen `` ` `` erzeugt (-> `` `CODE` ``).  
Um das Zeichen \` im Quellcode verwenden zu können, muss dieser mit zwei `` ` `` eingeleitet werden.  
Quelltext-Blöcke sind über Einrückungen möglich:

    Das ist ein Quelltext-Block.
    (Eingerückt mit 4 Leerzeichen)

URIs sind mit eckigen Klammern `<URI>` möglich: <https://google.de/>  
Auch Email-Adressen sind so möglich: <me@mail.de>

Bilder können mit `[Ref]: Pfad  "Opt. Titel"` referenziert und mit `![Alt-Text][Ref]` verwendet werden.  
Alternativ können Bilder direkt eingebunden werden: `![Alt-Text](Pfad)`

Zitate können mit `>` eingeleitet werden:  
> Das hat mal jemand Wichtiges gesagt.

Mehrere Zitatebenen sind ebenfalls möglich:  

> Dies ist die erste Zitat-Ebene.
>
> > Dies ist ein verschachteltes Zitat.
>
> Zurück auf der ersten Ebene.

> Mehrzeilige Zitate  
  sind auch so möglich

Horizontale Linien lassen sich über drei `*` oder drei `-` erzeugen:
***

Referenzen werden mit `[Name](Pfad)` gesetzt:  
Zu Google gehts [hier](https://google.de/) lang.

Generell kann auch die Referenz `[Google]: https://google.de/` ans Seitenende gesetzt und im Text mit `[Google][]` verwendet werden: [Google][]

Betonungen werden mit `*` oder `_` realisiert:  
`*` oder `_` ergibt *Wichtig!* Das hier _bitte_ lesen.  
`**` oder `__` ergibt **Wichtig!** Das hier __bitte__ lesen.

Tabellen können über pipes `|` und Trennzeichen `-` realisiert werden:  

    |Aufbau|einer|Tabelle|
    |------|-----|-------|
    |Inhalt|eins |zwei   |
    |Inhalt|drei |vier   |
    |Inhalt|fünf |sechs  |

|Aufbau|einer|Tabelle|
|------|-----|-------|
|Inhalt|eins |zwei   |
|Inhalt|drei |vier   |
|Inhalt|fünf |sechs  |

Unsortierte Listen werden mit `*`, `+` oder `-` erzeugt:
* Item
+ Item
- Item

Sortierte Listen werden mit einer Nummerierung wie `1. 2. 3.` erzeugt:
1. definierte
2. nummerierte
3. Abfolge

Generell kann jeder beliebige HTML-Code in Markdown verwendet werden.  
Dazu muss vor und nach dem Code-Block jeweils mindestens eine Leerzeile kommen.


[Google]: https://google.de/
