poooe
-----

Makes it easier to create initial structure of a website to a production server. This creates:

- a bare git repository (with a post-receive hook)
- a nginx configuration
- a logs directory
- a www directory (where the files are checked out)

## Usage

    poooe [sitename] [--type=nodejs]

If you don't enter `sitename` it will manually ask you to enter the domain name. But if you don't enter the type it will default to `nodejs`.

Accepted type parameter values:

    - nodejs
    - php