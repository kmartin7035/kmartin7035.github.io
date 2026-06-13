const contactEmail = "contact@neonspine.net";

window.authorSiteConfig = {
    profile: {
        name: "Katherine Martin",
        role: "Data Architect / Writer",
        email: contactEmail
    },

    meta: {
        pageTitle: "Katherine Martin // NEON SPINE",
        description: "Portfolio site for Katherine Martin."
    },

    terminal: {
        windowTitle: "guest@neon-spine: tty1",
        sessionHost: "neon-spine",
        promptUser: "guest",
        promptHome: "~",
        passwordMask: "********",
        ttyLine: "Ubuntu 24.04.2 LTS neon-spine tty1",
        commandPrompt: "guest@neon-spine:~$",
        dividerLength: 66,
        titleAscii: String.raw`
      _  __ __ _____ _  _ ___ ___ _ __  _ ___   __ __  __  ___ _____ _ __  _  
| |/ //  \_   _| || | __| _ \ |  \| | __| |  V  |/  \| _ \_   _| |  \| | 
|   <| /\ || | | >< | _|| v / | | ' | _|  | \_/ | /\ | v / | | | | | ' | 
|_|\_\_||_||_| |_||_|___|_|_\_|_|\__|___| |_| |_|_||_|_|_\ |_| |_|_|\__| 
        `,
        jellyfishAscii: String.raw`
                                   ***#######..#*                      
             **##*###.*###. .*##*       .           
          .*###***####.####*#.*#*##     .  #        
        *#**##..#####...##*#**#####*..  .. * ..     
      .*#*####..*#.**   ####*..#.##.*#. *. * . .*   
     .#*..#*#*  *. **  .#*.** .# *#.###.. .* .......
    .##..**..*  .   #   #.  #  .  *. .**#... .......
   .#*.  *.  *  .   *   *   .  .  *  ..###.  .  . . 
   ##*   ... .. .   *  *   **. #..*... .###  ... .. 
  .*** .  .****.*#*##*.#***######*.**..##*#.      . 
  *##*  ...#########*###################.##*   ..   
   *##.#.##*########.##*####*###.#**#*###..   .  ...
   ..#########*##################**#**##*    .  . . 
      *#*#.*#***##.*#*#*###.#.#.#*.*.*.*.   .   ..  
      *#.. ..****. .##*###*#*.##.*.# * *       ..  .
      .#... .##**  ..#*..####### .#* # *.     .   ..
      *.*** #*.#*     .**##*.#### #* #  *. .  .   . 
      #*#...#. #*    *...*#.#######* #   *.  .      
     *#.***#.  *#*.##   ..**.######.**    *.      . 
    *.* .*###..#..####.*###**####*#..*#. ..         
   *. ##.**.**.####*###*########*#*##.**.*          
 .*.  #..# *.#.##..*###*####*###.* .*###..#.      . 
 *.  **.#*##.*.*.. ..#..*##*.##..*.*###*###* .      
*.   *... ...#*#*.*##*#**##. ##.#* .*#***#*.***     
*   ** **  .#..##*########## #####. ...*.*##.#*#    
.*  #. #.  ..***#..*#.*.*###.##.*##.   *#**#.*##    
 .#.#  *   *.**##.*###*######.###*...#.*######.###. 
  *.#  *.* ####*###..#*.#.*##**##**   #.*#*.*# .##**
  ***. .*#####**##**.#####**#***#*#.. * .#.  ..*####
  ** . ...##*###*###*#.##*.**#*#.***  * .*.      .*#
  *  .** .########.***###*#.*.*#...#*.*...*   *#.##.
  # . *..##.#*.##*#**.####*.*.#*......#*  ..  .##.. 
  *   *.*#####...#*..*.*####.#**.*...#**   #  .*.   
  *.  **.*.***#.##**.#*#*##* .*#.##..#..*  *. ..    
  .*  *#****.....*..  **###.  **....* *...  .  .#   
   #  #*#. ##  .*#.*. .#.*#. .###. *. .. .. *.*#*   
   .. # ****.. .#...#**###.*###.#...   .* ...*..    
    #.* *#... ****. *####*.#*.*.**##.   *  *.*      
    **..*#   ....#. ##..#*.#.#. *#*##.  .*  *..     
    .*.*.*. .*#####*##..**#*..* *###.    *. .**     
     .#.*... *##*#..**.*###*..* *.*#.*##..*  **.    
      .... .*.#*## ****###.*  ***  #*.#*. *  .**    
       # *   .#####**#####.*#. #.  *##.*. *  .#*    
       .* *   .#**#* *###**.*.##. **..#.  *   ##    
        . *.   #**##..###**..#.#**#####   *   #*.   
        .*.# .**#####**###*#...*.....**#  *   .**   
         * *.*.*.#*..##...*#.###.*. *##.# *   ***   
         ...** .##**..** ...*###* *###*##**  ...    
          . #*  ..##..**  **.#*#*###**#...*  .      
          *.**    *#*##*  *..#.* ..*...   *         
          .****   ##*##.. .**#.*.   *    **    .    
           **.*   #**#**  *##*#**   *    *.    .    
           #*...  **.*#* *###.*##.  *   ..    .     
           #.  *. .#######**###..*  #.  *     *     
           #    . *###*.  *#***. *. ** ..     *     
           .    **.*##*  .##* **  . .*..      .     
           .     ****.*  *..#.##     .#*            
          .      .* .#  *#####*#      #.            
                  *..*..##*#..*..     .*            
                  **. *####.  .##    ...*           
                  .*.  *###.   *.    *. ..          
                 .**    *##..*       .*  .*         
              ... *.     .*#..##     .*   ..        
            ...   .        .####      *.            
          ...    .        .####*       .            
                          ..*.*                     
                          .###.                     
                          .*##                      
                           ..*#.                    
                             ...                    
        `,
        welcomeBox: {
            lines: [
                "Welcome to the Neon Spine.",
                "Click records to view."
            ]
        }
    },

    bio: {
        text: "Katherine Martin works in data architecture and experimental prose. She uses her background in chemistry for the construction of complex data systems and the maintenance of a single, oversized houseplant. Her work has appeared in Always Crashing, and she is the author of the novella Delete Me Kindly (Calamari Archive)."
    },

    system: {
        description: "I run a gamified critique Discord server for writers focused on improving craft through structured feedback.",
        link: "https://discord.gg/KEU8YqGQGp",
        label: "discord.gg/KEU8YqGQGp"
    },

    msg: {
        text: "Primary contact:",
        label: contactEmail,
        href: `mailto:${contactEmail}`
    },

    works: {
        sections: [
            { key: "forthcoming", label: "FORTHCOMING", fileName: "forthcoming.txt" },
            { key: "archive", label: "ARCHIVE", fileName: "archive.txt" }
        ],
        items: [
            {
                section: "archive",
                year: "2026",
                title: "Delete Me Kindly",
                descriptor: "Calamari Archive",
                link: "https://asterismbooks.com/product/delete-me-kindly-katherine-martin"
            },
            {
                section: "archive",
                year: "2026",
                title: "Tell Me I'm Alive",
                descriptor: "Always Crashing",
                publication: "Always Crashing",
                link: "http://alwayscrashing.com/current/2026/1/5/katherine-martin-tell-me-im-alive"
            }
        ]
    }
};
