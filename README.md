# Table Row Disabler

This extension helps prevent mistaken data entry by allowing users to disable rows they don't wish to use. The extension adds a padlock symbol to the far left of each table row. When the padlock is clicked all the inputs in the corresponding row will toggle to a 'disabled' or 'enabled' state. The extension remembers this state for return visits to the same webpage.

The goal is to protect the user from accidentally entering data into input fields they don't wish to modify.

Extra Details:

- The extension needs to be enabled the first time you visit a new website by clicking the extension icon. This allows the user to only run the extension on select websites.
- Currently the rows are hard set to be identified by the text in the first column of the table. This may lead to issues in tables that do not have unique names in the first column. Future versions will allow the user to specify which columns to use to identify the rows uniquely.

Future features:

- add an options page that allows the user to specify which columns to use to identify the rows uniquely & which column to attach the padlock symbol too.
- add a backend that allows users to login and share disabled rows state with other users.

Version History:
0.0.1: first release!

Chrome Web Store Link: (not published)
