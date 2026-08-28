import assert from 'node:assert/strict';
import { extractCaseDetails, extractContactDetails, extractState } from '../src/reportEngine.js';

const english = 'My full name is Adith Kumar. My phone no is 9845199090. The fraud happened in Karnataka.';
assert.deepEqual(extractContactDetails(english), { name: 'Adith Kumar', phone: '9845199090', email: '' });
assert.equal(extractState(english), 'Karnataka');

const kannada = 'ನನ್ನ ಹೆಸರು ಆದಿತ್ಯ ಕುಮಾರ್. ನನ್ನ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ೯೮೪೫೧೯೯೦೯೦. ಘಟನೆ ಕರ್ನಾಟಕದಲ್ಲಿ ೨೦೨೬ ಅಕ್ಟೋಬರ್ ೧೦ ರಂದು ಸಂಜೆ ೫ ಗಂಟೆಗೆ ಆಯಿತು.';
assert.deepEqual(extractContactDetails(kannada), { name: 'ಆದಿತ್ಯ ಕುಮಾರ್', phone: '9845199090', email: '' });
assert.equal(extractState(kannada), 'Karnataka');
assert.deepEqual(extractCaseDetails(kannada).incidentDate, '2026-10-10');
assert.deepEqual(extractCaseDetails(kannada).incidentTime, '17:00');

console.log('reportEngine mapping regression checks passed');
