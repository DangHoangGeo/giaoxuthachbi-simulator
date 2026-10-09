# Security and privacy reports

Please report these **privately**, not in a public issue:

- a password, token, private link or other credential found in the repository or its history;
- personal information or an image of a private person that should not be public;
- a way to reach protected content in the web application under `web/` without permission;
- a weakness that could let a contribution run code with the maintainer's credentials.

## How to report

Use **Security → Report a vulnerability** on the repository's GitHub page. This opens a private report that only the maintainer can read. If that option is not shown, open an issue that says only “private security report, please contact me” without any details, and the maintainer will reach you.

Include where the problem is (file, commit or URL) and how to reproduce it. Do not include the secret itself if a location is enough.

## What to expect

This is a volunteer project with one maintainer. Expect an acknowledgement within about a week. A committed secret is treated as exposed: it is replaced first, then removed.

## Not a security matter

The simulator does not control any installed equipment. Wrong calculations, unsafe design assumptions and unbuildable details are important, and they belong in ordinary [issues](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/issues) where other reviewers can see them.
