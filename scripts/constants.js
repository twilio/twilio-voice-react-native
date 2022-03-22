const { readFile } = require('fs').promises;

function denoteConstants(constantsSource) {
  const parse = (line) => {
    if (line.length === 0) {
      return { isWhitespace: true };
    }

    const commentMatch = /^\s*\/\/ (?<comment>.*)$/.exec(line);
    if (commentMatch && commentMatch.groups.comment) {
      return { isComment: true, line: commentMatch.groups.comment };
    }

    return { line };
  };

  const denotedConstants = constantsSource.split('\n').map(parse);

  if (
    denotedConstants.length > 0 &&
    denotedConstants[denotedConstants.length - 1].isWhitespace
  ) {
    denotedConstants.pop();
  }

  return denotedConstants;
}

function templateConstants(templateSource) {
  const parse = (line) => {
    if (line.length === 0) {
      return { isWhitespace: true };
    }

    const contentMatch = /^(?<prefix>.*){{CONTENT}}(?<postfix>.*)$/.exec(line);
    if (contentMatch) {
      return {
        isContent: true,
        prefix: contentMatch.groups.prefix,
        postfix: contentMatch.groups.postfix,
      };
    }

    return { line };
  };

  const denotedTemplate = templateSource.split('\n').map(parse);
}

async function main() {
  const constantsSource = (
    await readFile('./constants/constants.src')
  ).toString('utf-8');

  const templateSource = (
    await readFile('./constants/constants.typescript.template')
  ).toString('utf-8');

  const denotedConstants = denoteConstants(constantsSource);



  console.log(denotedConstants);


  // /{{CONSTANTS}}/.exec(consta)
}

main();
