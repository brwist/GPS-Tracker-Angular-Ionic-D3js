module.exports = {
  singleQuote: true,
  overrides: [
    {
      files: ['*.ts', '*.js', '*.json', '*.yml'],
      options: {
        printWidth: 120,
        tabWidth: 2,
        semi: true,
        trailingComma: 'none'
      }
    }
  ]
};
