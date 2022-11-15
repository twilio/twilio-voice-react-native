'use strict';

const { readFile, writeFile } = require('fs').promises;

function parseConstants(constantsSource) {
  const parse = (line, idx) => {
    if (line.length === 0) {
      return { isWhitespace: true };
    }

    const commentMatch = /^\s*\/\/ (?<comment>.*)$/.exec(line);
    if (commentMatch && commentMatch.groups.comment) {
      return { isComment: true, comment: commentMatch.groups.comment };
    }

    const constantMatch = /^(?<label>.*)=(?<literal>.*)$/.exec(line);
    if (
      constantMatch &&
      constantMatch.groups.label &&
      constantMatch.groups.literal
    ) {
      return {
        isConstant: true,
        label: constantMatch.groups.label,
        literal: constantMatch.groups.literal,
      };
    }

    throw new Error(`Constants source malformed on line: ${idx}.`);
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

function parseTemplate(templateSource) {
  const parse = (line) => {
    if (line.length === 0) {
      return { isWhitespace: true };
    }

    const commentMatch = /{{COMMENT}}/.exec(line);
    if (commentMatch) {
      return { isComment: true, content: line };
    }

    const labelMatch = /{{LABEL}}/.exec(line);
    const literalMatch = /{{LITERAL}}/.exec(line);
    if (labelMatch && literalMatch) {
      return { isConstant: true, content: line };
    } else if (labelMatch || literalMatch) {
      throw new Error(
        'Template file malformed. \
        Constant template must have a {{LABEL}} and {{LITERAL}}.'
      );
    }

    return { content: line };
  };

  const denotedTemplate = templateSource.split('\n').map(parse);

  const commentTemplates = denotedTemplate.reduce(
    (acc, { isComment, content }, idx) =>
      isComment ? [...acc, { content, idx }] : acc,
    []
  );
  if (commentTemplates.length !== 1) {
    throw new Error(
      `Template file malformed. Incorrect number of lines \
      (${commentTemplates.length}) describing "comment" template. \
      Should be (1).`
    );
  }
  const commentTemplateIdx = commentTemplates[0].idx;

  const constantTemplates = denotedTemplate.reduce(
    (acc, { isConstant, content }, idx) =>
      isConstant ? [...acc, { content, idx }] : acc,
    []
  );
  if (constantTemplates.length !== 1) {
    throw new Error(
      `Template file malformed. Incorrect number of lines \
      (${constantTemplates.length}) describing "constant" template. \
      Should be (1).`
    );
  }
  const constantTemplateIdx = constantTemplates[0].idx;

  if (commentTemplateIdx + 1 !== constantTemplateIdx) {
    throw new Error(
      'Template file malformed. \
      Comment template and constant template must be sequential.'
    );
  }

  denotedTemplate.splice(commentTemplateIdx, 2, {
    isBody: true,
  });

  return {
    denotedTemplate,
    constantTemplate: constantTemplates[0].content,
    commentTemplate: commentTemplates[0].content,
  };
}

function merge(
  denotedConstants,
  denotedTemplate,
  commentTemplate,
  constantTemplate
) {
  const mapConstant = (constant) => {
    if (constant.isWhitespace) {
      return '';
    }
    if (constant.isComment) {
      return String(commentTemplate).replace(/{{COMMENT}}/g, constant.comment);
    }
    if (constant.isConstant) {
      return String(constantTemplate)
        .replace(/{{LABEL}}/g, constant.label)
        .replace(/{{LITERAL}}/g, constant.literal);
    }
  };

  const mapTemplate = (templateLine) => {
    if (templateLine.isWhitespace) {
      return '';
    }
    if (templateLine.isBody) {
      return denotedConstants.map(mapConstant);
    }
    return templateLine.content;
  };

  return denotedTemplate.flatMap(mapTemplate);
}

async function transform(constantsPath, templatePath, outputPath) {
  const constantsSource = (await readFile(constantsPath)).toString('utf-8');

  const templateSource = (await readFile(templatePath)).toString('utf-8');

  const denotedConstants = parseConstants(constantsSource);

  const { denotedTemplate, commentTemplate, constantTemplate } =
    parseTemplate(templateSource);

  const mergedConstants = merge(
    denotedConstants,
    denotedTemplate,
    commentTemplate,
    constantTemplate
  );

  await writeFile(outputPath, mergedConstants.join('\n'));
}

async function main() {
  const constantsPath = './constants/constants.src';

  // Transform TS files
  const tsTemplatePath = './constants/constants.typescript.template';
  const tsOutputPath = './src/constants.ts';

  await transform(constantsPath, tsTemplatePath, tsOutputPath);

  // Transform Java files
  const javaTemplatePath = './constants/constants.java.template';
  const javaOutputPath =
    './android/src/main/java/com/twiliovoicereactnative/CommonConstants.java';

  await transform(constantsPath, javaTemplatePath, javaOutputPath);

  // Transform ObjC files
  const objcTemplatePath = './constants/constants.objc.template';
  const objcOutputPath = './ios/TwilioVoiceReactNativeConstants.h';

  await transform(constantsPath, objcTemplatePath, objcOutputPath);
}

main();
