poooe
-----

Makes it easier to create initial structure of a website to a production server. This creates:

- a bare git repository (with a post-receive hook)
- a nginx configuration
- a logs directory
- a www directory (where the files are checked out)

## Install

    npm install -g poooe

## Usage

    poooe [sitename] [--type] [--nginxpath]

> You might want to use **sudo** when not the root user

<table>
    <tr>
        <td>Parameter</td>
        <td>Default</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>sitename</td>
        <td><em>None</em></td>
    </tr>
    <tr>
        <td>type</td>
        <td>nodejs</td>
        <td><code>nodejs</code> or <code>php</code></td>
    </tr>
    <tr>
        <td>nginxpath</td>
        <td>/etc/nginx/sites-enabled/</td>
    </tr>
</table>

## Example

Linux:
![Linux](http://i.imgur.com/8SSFW9b.png)

Windows:
![Windows](http://i.imgur.com/I1tG6mE.png)

See `lib/templates` for the git hook and nginx config template.