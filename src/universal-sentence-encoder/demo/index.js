/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs-core';
import {interpolateReds} from 'd3-scale-chromatic';

const sentences = [
  'Create react software component that allows users to input personal interests', 
  'New Substrate pallet that enables sudo access to the network',
  'Create a poem that describes the way the universe works in a stylish and poetic way',
  'Train a machine learning model that recommends tasks to profiles with specific interests',
  'Conduct interviews with business regarding the new way of creating digital contracts',
  'Grow strawberries and sell then on the market.'
];

const init = async () => {
  const model = await use.load();
  document.querySelector('#loading').style.display = 'none';
  renderSentences();

  const embeddings = await model.embed(sentences);
  const matrixSize = 250;
  const cellSize = matrixSize / sentences.length;
  const canvas = document.querySelector('canvas');
  canvas.width = matrixSize;
  canvas.height = matrixSize;

  const ctx = canvas.getContext('2d');

  const xLabelsContainer = document.querySelector('.x-axis');
  const yLabelsContainer = document.querySelector('.y-axis');

  for (let i = 0; i < sentences.length; i++) {
    const labelXDom = document.createElement('div');
    const labelYDom = document.createElement('div');

    labelXDom.textContent = i + 1;
    labelYDom.textContent = i + 1;
    labelXDom.style.left = (i * cellSize + cellSize / 2) + 'px';
    labelYDom.style.top = (i * cellSize + cellSize / 2) + 'px';

    xLabelsContainer.appendChild(labelXDom);
    yLabelsContainer.appendChild(labelYDom);

    for (let j = i; j < sentences.length; j++) {
      const sentenceI = tf.slice(embeddings, [i, 0], [1]);
      const sentenceJ = tf.slice(embeddings, [j, 0], [1]);
      const sentenceITranspose = false;
      const sentenceJTransepose = true;
      const score =
          tf.matMul(
                sentenceI, sentenceJ, sentenceITranspose, sentenceJTransepose)
              .dataSync();

      ctx.fillStyle = interpolateReds(score);
      ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
};
const initQnA = async () => {
  const input = {
    queries: ['Create react software component that allows users to input personal interests'],
    responses: [
      'react, software, development, web', 'Business, Analysis, Strategy',
      'Farming, Agriculture'
    ]
  };
  const model = await use.loadQnA();
  document.querySelector('#loadingQnA').style.display = 'none';
  let result = model.embed(input);
  const dp = tf.matMul(result['queryEmbedding'], result['responseEmbedding'],
      false, true).dataSync();
  for (let i = 0; i < dp.length; i++) {
    document.getElementById(`answer_${i + 1}`).textContent =
        `${dp[i]}`
  }
};
init();
initQnA();

const renderSentences = () => {
  sentences.forEach((sentence, i) => {
    const sentenceDom = document.createElement('div');
    sentenceDom.textContent = `${i + 1}) ${sentence}`;
    document.querySelector('#sentences-container').appendChild(sentenceDom);
  });
};
