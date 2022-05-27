module.exports = {
    presets: [
        [
        '@babel/preset-env', { 
            targets: 
            { node: 'current' },
            exclude: [
                'transform-exponentiation-operator'
              ]
        }
        
    ],
        '@babel/preset-typescript'
    ],
};