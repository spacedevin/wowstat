using System;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Diagnostics;

namespace wowstat
{
	public class Program
	{
		/// <summary>
		/// The main entry point for the application.
		/// </summary>
        [STAThread]
        private static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            functions functions = functions.getInstance();
            if (args.Length == 1)
            {
                if (args[0] == "1")
                {
                    functions.hideOnOpen = true;
                }
            }
            else if (args.Length == 2)
            {
                if (args[0] == "1")
                {
                    functions.hideOnOpen = true;
                }
                functions.forceRealm = args[1];
            }
            Application.Run(new frmMain());
        }

       
	}
}