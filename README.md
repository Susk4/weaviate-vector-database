# Vector Database with Weaviate

This Git repository contains a Node.js project that implements a basic vector database using Weaviate and OpenAi The project provides two main functions: `migrate` and `query`.

## Prerequisites

Before using this project, make sure you have the following prerequisites installed:

- [Node.js](https://nodejs.org/)
- [Weaviate](https://www.semi.technology/open-source/weaviate)

## Installation

1. Clone the repository to your local machine:

```bash
git clone <repository-url>
```

2. Install project dependencies:

```bash
npm install
```

3. Configure your Weaviate instance by updating the connection details in the config.js file.

## Usage
### Migrate Data

Use the migrate function to seed the Weaviate database with data from the data.js file. Optionally, you can use the --delete-all switch to remove all existing data in the database before migrating.

To migrate data, run the following command:
```bash
npm run start migrate --delete-all
```

### Query Data

Use the query function to search for data in the Weaviate database. The second parameter should be the query string.

To query data, run the following command:
```bash
npm run start query "query-string"
```
Replace <query-string> with the query you want to execute.


### License

This project is licensed under the MIT License. See the LICENSE file for details.

### Contact

If you have any questions or need assistance, please contact balazs.henrik0103@gmail.com.

Feel free to contribute to this project or report any issues. Happy coding!