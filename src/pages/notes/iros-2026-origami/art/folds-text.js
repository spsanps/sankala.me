// The words of "The five folds": each stage's name, its instruction and who got there. Shared by the page (which
// prints them before the drawing loads) and the figure.
export const STAGES = [
  { name: 'Corner', say: 'Valley-fold the left corner to the centre line.', mark: 'My policy, clean', done: true },
  { name: 'Corner', say: 'Valley-fold the right corner to the centre line.', mark: 'My policy, with one assist', done: true },
  { name: 'Centre', say: 'Mountain-fold in half along the centre line.', mark: 'Only the winning team got here' },
  { name: 'Wing', say: 'Valley-fold the wing down along its line.', mark: 'Nobody got here' },
  { name: 'Wing', say: 'Repeat behind with the other wing.', mark: 'Nobody got here' },
];
export const statusFor = i => `${i + 1}. ${STAGES[i].say} ${STAGES[i].mark}.`;
