/* eslint-disable @typescript-eslint/no-explicit-any */
export function createFilter(filterParam: string): any {
  const filter: any = {};
  if (filterParam) {
    filterParam.split('::').forEach((f) => {
      const nv = f.split('=', 2);
      if (filter[nv[0]]) {
        filter[nv[0]].push(nv[1]);
      } else {
        filter[nv[0]] = nv[1].split(',');
      }
    });
    Object.keys(filter).forEach((key: string) => {
      filter[key] = { $in: filter[key] };
    });
  }
  return filter;
}
