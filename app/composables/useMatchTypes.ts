export const useMatchTypes = () => {
  return {
    1: '1v1',
    2: '2v2',
    3: '3v3',
    4: '4v4',
    0: 'Custom',
  } as const
}
