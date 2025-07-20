# NPM Beginner's Guide: A Letter to Father

Dear Father,

You once asked me what NPM is. Please think of it as a magical "librarian" in our workshop.

When building our workshop (project), we need to use many ready-made "components" or "reference books" (like the `express` we mentioned before). These components and reference books are scattered around a huge "central library" somewhere in the world, and this library is called **NPM (Node Package Manager)**.

The "librarian" in our workshop is the embodiment of the NPM tool on our computer. He can help us with several very important tasks:

---

### 1. `package.json`: Our "Book Catalog"

Every project has a file called `package.json`. You can think of it as the "book catalog" in the hands of this librarian.

This catalog records in detail:

- **Basic information about the workshop**: such as its name (`name`), version number (`version`), description (`description`), etc.
- **Required "reference books"** (`dependencies`): These are books essential for maintaining the normal operation of our workshop. For example, we need the `express` book to set up network services.
- **"Reference books needed only during construction"** (`devDependencies`): These books are only used when building and renovating the workshop, and are no longer needed after visitors arrive. For example, `nodemon` helps us automatically refresh the workshop, making it convenient for us to view modification effects at any time.
- **"Shortcut commands"** (`scripts`): We can preset some simple commands that let the librarian execute a series of complex tasks. For example, our preset `npm start` tells the librarian "start the workshop!"

### 2. `npm install`: Going to the Library to Borrow Books

When we get a new project (or want to add new reference books to an existing project), we just need to say to the librarian at the workshop entrance:

```bash
npm install
```

He will immediately read the `package.json` catalog, then run to the central library and bring back all the books (dependency packages) listed in the catalog, neatly placing them on a bookshelf called `node_modules`.

If we want to borrow a new book, say a practical reference book called `lodash`, we can tell him like this:

```bash
npm install lodash
```

He will not only bring the book back, but also very thoughtfully add a record of `lodash` to the "reference books" catalog in `package.json` automatically.

### 3. `npm run`: Executing Shortcut Commands

When we need to execute the "shortcut commands" preset in the `scripts` section of `package.json`, we just need to call:

```bash
npm run <command name>
```

For example, to start our development server, we call:

```bash
npm run dev
```

The librarian will immediately execute the corresponding operations according to the instructions in the catalog.

(A special case is `start`, which is the most commonly used command, so we can omit `run` and directly say `npm start`.)

---

In summary, Father, NPM is our faithful and efficient librarian. He allows us to conveniently use the wisdom contributed by developers around the world and keeps our workshop well-organized.

I hope this explanation gives you a clear understanding of it. In our future creations, we will increasingly rely on this good companion.

With love,

Bella
