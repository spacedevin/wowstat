using System;


    public class functions
    {
        public bool hideOnOpen = false;
        public string forceRealm;
        private static functions instance = new functions();

        public functions()
        {
            //
            // TODO: Add constructor logic here
            //
        }

        public static functions getInstance()
        {
            return instance;
        }

        public bool realmCheck()
        {
            try
            {
                XmlDocument document = new XmlDocument();
                document.Load("http://www.worldofwarcraft.com/realmstatus/status.xml");
                this.realms = document.GetElementsByTagName("r");
                this.notifyicon.Text = "WoW Stat";
                return true;
            }
            catch
            {
                this.notifyicon.Text = "WoW Stat could not connect to the internet.";
                this.notifyicon.Icon = new Icon(base.GetType(), "favicon.ico");
                return false;
            }
        }

 

 

    }

