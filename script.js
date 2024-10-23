const fs = require('fs');
const path = require('path');

var num = 0;

// Directory to start scanning
const startDir = './'; // Change this to your starting directory if needed
const outputFilePath = 'output.txt';

// Function to get all .js files from a directory recursively
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules') {
      getAllJsFiles(filePath, fileList);
    } else if (path.extname(file) === '.js') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to write all .js file names, paths, and content to a .txt file
function writeJsFilesToTxt(jsFiles, outputFile) {
  const writeStream = fs.createWriteStream(outputFile);

  jsFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    writeStream.write(`File: ${filePath}\n`);
    writeStream.write('----------------------------------------\n');
    writeStream.write(`${content}\n\n`);
    num  = num +1;
  });


  writeStream.end();
}

// Main process
try {
  const jsFiles = getAllJsFiles(startDir);
  writeJsFilesToTxt(jsFiles, outputFilePath);
  console.log(`All JavaScript files have been written to ${outputFilePath}`);
  console.log(num);
} catch (err) {
  console.error('Error:', err);
}