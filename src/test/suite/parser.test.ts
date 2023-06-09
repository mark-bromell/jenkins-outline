import * as assert from 'assert';
import * as vscode from 'vscode';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { parseJenkinsFile } from '../../parser';

const simpleJenkinsfile = `
pipeline {
    options {

    }
    agent none
}
`;

const jenkinsfile = `


pipeline {
    options {

    }
    agent none
    stages {
        stage("Setup") {
            parallel {
                stage('Pre-action') {
                    stages {
                        stage('One') {

                        }
                        stage('Two') {

                        }
                    }
                }
                stage('Downloading') {
                    sh '''
                        # triple \"quote test {{}
                    '''
                }
            }
        }
        stage('Static Scan') {
            when { 
                beforeAgent true
                expression { true }
            }
            agent { label 'my-agent' }
            steps {
                container('my-agent') {

                }
                container('other-container') {
                    sh """
                        # triple quote test }}}
                    """
                }
            }
        }
        stage('Build and Test') {
            matrix {
                agent any
                axes {
                    axis {
                        name 'PLATFORM'
                        values 'linux', 'windows', 'mac'
                    }
                    axis {
                        name 'BROWSER'
                        values 'firefox', 'chrome', 'safari', 'edge'
                    }
                }
                stages {
                    stage('Build') {
                        steps {
                            echo "Do Build for \${PLATFORM} - \${BROWSER}"
                        }
                    }
                    stage('Test') {
                        steps {
                            echo "Do Test for \${PLATFORM} - \${BROWSER}"
                        }
                    }
                }
            }
        }
        stage('Report') {
            agent any
            steps {

            }
        }
    }
}
`;

suite('Parser test suite', () => {
    test('Empty pipeline returns emtpy list of stages', () => {
        const stages: vscode.DocumentSymbol[] = parseJenkinsFile(simpleJenkinsfile);
        assert.strictEqual(stages.length, 0);
    });

    test('Stages count is correct', () => {
        const stages: vscode.DocumentSymbol[] = parseJenkinsFile(jenkinsfile);
        assert.strictEqual(stages.length, 4);
        assert.strictEqual(stages[0].children.length, 2);
        assert.strictEqual(stages[0].children[0].children.length, 2);
        assert.strictEqual(stages[2].children.length, 2);
    });

    test('Stages are parsed correctly', () => {
        const stages: vscode.DocumentSymbol[] = parseJenkinsFile(jenkinsfile);
        assert.strictEqual(stages.length, 4);
        assert.strictEqual(stages[0].name, 'Setup');
        assert.strictEqual(stages[0].children[0].name, 'Pre-action');
        assert.strictEqual(stages[0].children[0].children[0].name, 'One');
        assert.strictEqual(stages[0].children[0].children[1].name, 'Two');
        assert.strictEqual(stages[0].children[1].name, 'Downloading');

        assert.strictEqual(stages[1].name, 'Static Scan');

        assert.strictEqual(stages[2].name, 'Build and Test');
        assert.strictEqual(stages[2].children[0].name, 'Build');
        assert.strictEqual(stages[2].children[1].name, 'Test');

        assert.strictEqual(stages[3].name, 'Report');
    });
});
