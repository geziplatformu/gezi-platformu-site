import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({window:{},document:{getElementById:()=>null,querySelectorAll:()=>[]},Date,Intl});
vm.runInContext(fs.readFileSync(new URL('../app-core.js',import.meta.url),'utf8').split('function tourCard')[0],context);
const next=(text,y,m,d)=>{context.caseText=text;context.caseToday=new Date(y,m-1,d);return vm.runInContext('nextRecurringDate(caseText,caseToday)',context)?.date};
const day=d=>d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:undefined;
assert.equal(day(next('2026 yılı Ekim ve Kasım ayı boyunca her Salı, Cumartesi ve Pazar',2026,10,7)),'2026-10-10');
assert.equal(day(next('2026 yılı Ekim ve Kasım ayı boyunca her Çarşamba, Cumartesi ve Pazar',2026,10,7)),'2026-10-07');
assert.equal(day(next('2026 yılı Ekim–Kasım boyunca her Salı',2026,11,28)),undefined);
assert.equal(day(next('2026 yılı Ekim ve Kasım ayı boyunca her Cumartesi',2026,12,1)),undefined);
assert.equal(day(next('2026 yılı Ekim ve Kasım ayı boyunca her Cumartesi',2027,10,1)),undefined);
assert.equal(day(next('2026 yılı Haziran–Eylül ayı boyunca her Salı',2026,7,1)),'2026-07-07');
assert.equal(day(next('2026 yılı Aralık–Şubat ayı boyunca her Cumartesi',2027,1,1)),'2027-01-02');
assert.equal(day(next('2026 yılı Aralık–Şubat ayı boyunca her Cumartesi',2027,12,1)),undefined);
assert.equal(day(next('Ekim–Kasım boyunca her Cumartesi',2027,10,1)),undefined);
console.log('Tour date checks: weekday, month ranges, fixed years and cross-year seasons passed.');

const explicit=(text,y,m,d,scheduleYear)=>{context.caseText=text;context.caseToday=new Date(y,m-1,d);context.scheduleYear=scheduleYear;return vm.runInContext('parseExplicitPiece(caseText,caseToday,scheduleYear)',context)?.date;};
assert.equal(day(explicit('15–20 Aralık',2026,10,12)),undefined);
assert.equal(day(explicit('5–10 Ocak 2027',2026,10,12)),'2027-01-05');
assert.equal(day(explicit('16–19 Ekim',2027,10,1,2026)),'2026-10-16');
assert.equal(day(explicit('30 Ekim–02 Kasım',2026,10,12,2026)),'2026-10-30');
console.log('Yearless dates are never assigned an invented year; dated schedules never roll forward.');

// Exercise the published winter record, especially its December/January boundary.
vm.runInContext(fs.readFileSync(new URL('../tours.js',import.meta.url),'utf8'),context);
context.winterTour=context.window.TOURS.find(t=>t.id==='dogu-ekspresi-erzurum-kars-agri-van');
const winterDepartures=['2026-12-15','2026-12-29','2027-01-05','2027-01-12','2027-01-24','2027-01-26','2027-02-01','2027-02-16','2027-03-05','2027-03-09','2027-03-10'];
assert.deepEqual(context.winterTour.dates.split('•').map(piece=>day(explicit(piece,2026,10,19))),winterDepartures);
vm.runInContext('trToday=()=>caseToday',context);
for(const [today,expected] of [
 ['2026-10-19','2026-12-15'],['2026-12-15','2026-12-15'],
 ['2026-12-16','2026-12-29'],['2026-12-29','2026-12-29'],
 ['2026-12-30','2027-01-05'],['2027-01-01','2027-01-05'],
 ['2027-03-10','2027-03-10'],['2027-03-11',undefined],
 ['2027-10-19',undefined]
]){
 const [y,m,d]=today.split('-').map(Number);context.caseToday=new Date(y,m-1,d);
 assert.equal(day(vm.runInContext('nearestTourDate(winterTour)',context)?.date),expected,`Winter nearest date on ${today}`);
}
console.log('Published winter dates: all 11 departures, today inclusion, new year and season expiry passed.');
