const fs = require('fs');
const path = require('path');

function appendLineToFile(filePath, lineToAdd) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid filePath');
  }
  if (!lineToAdd || typeof lineToAdd !== 'string') {
    throw new Error('Invalid lineToAdd');
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }

    if (data.includes(lineToAdd)) {
      console.log(`Line '${lineToAdd}' already exists in ${filePath}`);
      return;
    }

    const updatedData = data.trim() + '\n' + lineToAdd.trim() + '\n';

    fs.writeFile(filePath, updatedData, 'utf8', err => {
      if (err) {
        throw err;
      }
      console.log(`Line '${lineToAdd}' added to ${filePath}`);
    });
  });
}

module.exports = {
  appendLineToFile,
};
