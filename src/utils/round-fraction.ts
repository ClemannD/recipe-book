/**
 * This monstrosity comes from ChatGPT. The prompt was:
 * "Code only. Code in typescript. Give me a function which will take in a number and round it to the nearest clean fraction.
 * It should display 1.5 as "1 1/2" and should display 1 as "1" and should display 1.33 as "1 1/3" and it should display 0.33 as "1/3".
 * It should round weird fractions to the nearest clean fraction. That is to say, 0.555555 should show as "1/2".  1.625452 should show as "1 2/3""
 *
 * I had to make some slight modifications to make it work still.
 */
export function roundToCleanFraction(num: number): string {
  const EPSILON = 0.00000000001;
  const whole = Math.floor(num); // 0
  const fraction = num - whole; // 0.5

  const fractions = [
    { fraction: 0, name: '' },
    { fraction: 1 / 10, name: '1/10' },
    { fraction: 2 / 10, name: '2/10' },
    { fraction: 3 / 10, name: '3/10' },
    { fraction: 7 / 10, name: '7/10' },
    { fraction: 9 / 10, name: '9/10' },

    { fraction: 1 / 8, name: '1/8' },
    { fraction: 3 / 8, name: '3/8' },
    { fraction: 5 / 8, name: '5/8' },
    { fraction: 7 / 8, name: '7/8' },

    { fraction: 1 / 6, name: '1/6' },
    { fraction: 5 / 6, name: '5/6' },

    { fraction: 1 / 5, name: '1/5' },
    { fraction: 2 / 5, name: '2/5' },
    { fraction: 3 / 5, name: '3/5' },
    { fraction: 4 / 5, name: '4/5' },

    { fraction: 1 / 4, name: '1/4' },
    { fraction: 3 / 4, name: '3/4' },

    { fraction: 1 / 3, name: '1/3' },
    { fraction: 2 / 3, name: '2/3' },

    { fraction: 1 / 2, name: '1/2' },
    { fraction: 1, name: '' },
  ];

  // handle whole number case
  if (Math.abs(fraction) < EPSILON) {
    return `${whole}`;
  }

  // find the nearest clean fraction
  let smallestDifference = Infinity;
  let closestFraction = fractions[0];
  for (let i = 0; i < fractions.length; i++) {
    const fractionValue = fractions[i]!.fraction;
    const difference = Math.abs(fractionValue - fraction);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestFraction = fractions[i];
    }
  }

  // handle negative number case
  if (num < 0) {
    return `-${whole} ${closestFraction!.name}`;
  }

  // handle mixed number case
  if (whole > 0) {
    return `${whole} ${closestFraction!.name}`;
  }

  // handle proper fraction case
  return closestFraction!.name;
}
