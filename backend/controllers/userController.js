var validate = require('../response/validateparameter');
var errorResponse = require('../response/error');
var email = require('./emailcontroller');
var mysql = require('./mysqlconnect');
const jwt = require('jsonwebtoken');
const {isNullOrUndefined} = require('util');
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
var hour = today.getHours();
var minute = today.getMinutes();
var second = today.getSeconds();
if (dd < 10) {
    dd = '0' + dd;
}
if (mm < 10) {
    mm = '0' + mm;
}
today = yyyy + '-' + mm + '-' + dd;

let updatedate = yyyy + '-' + mm + '-' + dd + ' ' + hour + ':' + minute + ':' + second;

let adminEmail = 'info.guamlicensing@gmail.com';

// ====================================================================================================

const findApplicationQuery = function (data, cb) {
    if (!(isNullOrUndefined(data.formType))) {

        const query = `SELECT idApplication, userid, Applicant_seq, ApplicationForm_type, status FROM application WHERE ? and ?`;
        let where = [];
        where.push({ApplicationForm_type: data.formType});
        where.push({userid: data.userId});
        mysql(query, where, cb);
    } else {

        const query = `SELECT idApplication, userid, Applicant_seq, ApplicationForm_type, status FROM application WHERE ?`;
        let where = [];
        where.push({idApplication: data});
        mysql(query, where, cb);
    }
}

const findlastSeqNofromUser = function (userId, cb) {
    const query = `select Applicant_seq from application where userid = ? order by createdate DESC limit 1`;
    mysql(query, [userId], cb);
}

const findApplicantQuerybySeqandUserId = function (data, cb) {
    let query;
    let where = [];
    if (data.role === 'user') {
        query = `SELECT seq, userid, status, firstname, lastname, middlename, email, ssnid, gender, dob, placeofbirth, permanentAddress, permanentAddressCity, permanentAddressState, permanentAddressZip, mailAddress, mailAddressCity, mailAddressZip, mailAddressState, contactHome, contactCell, contactWork, ECFMG, FLEX1, FLEX2, NBME1, NBME2, NBME3, USMLE1, USMLE2, USMLE3, previousfirstname, previouslastname, workcity, workstate, workzip, professionalinformation, areaofpractice, workaddress, medicalLicenseNo, expirationDate, guamRegNo, guamExpirationDate, workGuamLastSixM, currentLicense, medicalSchoolAttended, medicalSchoolState, deaNumber, deaExpirationDate, narcotic1, nonnarcotic1, narcotic2, nonnarcotic2 FROM applicant WHERE ? and ?`;
        where.push({userid: data.userid});
        where.push({seq: data.Applicant_seq});
    } else {
        query = `SELECT seq, userid, status, firstname, lastname, middlename, email, ssnid, gender, dob, placeofbirth, permanentAddress, permanentAddressCity, permanentAddressState, permanentAddressZip, mailAddress, mailAddressCity, mailAddressZip, mailAddressState, contactHome, contactCell, contactWork, ECFMG, FLEX1, FLEX2, NBME1, NBME2, NBME3, USMLE1, USMLE2, USMLE3, previousfirstname, previouslastname, workcity, workstate, workzip, professionalinformation, areaofpractice, workaddress, medicalLicenseNo, expirationDate, guamRegNo, guamExpirationDate, workGuamLastSixM, currentLicense, medicalSchoolAttended, medicalSchoolState, deaNumber, deaExpirationDate, narcotic1, nonnarcotic1, narcotic2, nonnarcotic2 FROM applicant WHERE ?`;
        where.push({seq: data.Applicant_seq});
    }
    mysql(query, where, cb);
}

const findRecordofAOPbyid = function (data, cb) {
    const query = `SELECT idAreaOfPractice, userid, Applicant_seq, areaOfPractice, description, date FROM areaofpractice WHERE ? and ?`;
    let where = [];
    where.push({userid: data.userid});
    where.push({Applicant_seq: data.Applicant_seq});
    mysql(query, where, cb);
}

const findRecordofSpecialitybyid = function (data, cb) {
    const query = `SELECT idSpeciality, userid, Applicant_seq, speciality, dateissued, dateexpired FROM speciality WHERE ? and ?`;
    let where = [];
    where.push({userid: data.userid}, {Applicant_seq: data.Applicant_seq});
    mysql(query, where, cb);
}

const findRecordofWorkHistorybyid = function (data, cb) {
    const query = `SELECT idWorkHistory, userid, Applicant_seq, fromDate, toDate, location, typeOfPractice, reasonforDiscontinue FROM workhistory WHERE ? and ?`;
    let where = [];
    where.push({userid: data.userid}, {Applicant_seq: data.Applicant_seq});
    mysql(query, where, cb);
}

const findRecordofEducationbyid = function (data, cb) {
    const query = `SELECT idEducation, userid, Applicant_seq, schoolName, address, addressCity, addressState, addressZip, dateEducated, degree, type, photo FROM education WHERE ? and ?`;
    let where = [];
    where.push({userid: data.userid}, {Applicant_seq: data.Applicant_seq});
    mysql(query, where, cb);
}

const findRecordofEmploymentHistorybyid = function (data, cb) {
    const query = `SELECT id, employer, address, date, createdate, Applicant_seq, userid FROM employmenthistory WHERE ? and ?`;
    let where = [];
    where.push({userid: data.userid}, {Applicant_seq: data.Applicant_seq});
    mysql(query, where, cb);
}

const findRecordofQuestionorybyid = function (data, cb) {
    const query = `SELECT Questionaire_questionno, answer FROM applicantquestionaire WHERE ? and ?`;
    let where = [];
    where.push({userid: data.userid}, {Applicant_seq: data.Applicant_seq});
    mysql(query, where, cb);
}

const findRecordofcontinuingeducationbyid = function (data, cb) {
    const query = `SELECT idContinuingEducation, userid, Applicant_seq, idEducationCategory, coursetitle, sponsoredby, datesattended, accrededapprovedby, credithours FROM continuingeducation WHERE ? and ?`;
    let where = [];
    where.push({userid: data.userid}, {Applicant_seq: data.Applicant_seq});
    mysql(query, where, cb);
}

const findSubTableData = function (body, cb) {
    let arrayLen = ['areaofpractice', 'speciality', 'workhistory', 'education', 'employmenthistory', 'questionary', 'continuingeducation'];
    let count = 0;
    let final = {};
    let data = {
        userid: body.userId,
        Applicant_seq: body.seq
    }
    findRecordofAOPbyid(data, function (err, AOPdata) {
        if (err) {
            cb(err, null)
        } else {
            count++;
            if ((AOPdata !== null)) {
                final['areaofpractice'] = AOPdata
                if ((arrayLen.length === count)) {
                    cb(null, final);
                }
            }
        }
    })
    findRecordofSpecialitybyid(data, function (err, Specialitydata) {
        if (err) {
            cb(err, null)
        } else {
            count++;
            if ((Specialitydata !== null)) {
                final['speciality'] = Specialitydata;
                if ((arrayLen.length === count)) {
                    cb(null, final);
                }
            }
        }
    })
    findRecordofWorkHistorybyid(data, function (err, WorkHistorydata) {
        if (err) {
            cb(err, null)
        } else {
            count++;
            if ((WorkHistorydata !== null)) {
                final['workhistory'] = WorkHistorydata;
                if ((arrayLen.length === count)) {
                    cb(null, final);
                }
            }
        }
    })
    findRecordofEducationbyid(data, function (err, Educationdata) {
        if (err) {
            cb(err, null)
        } else {
            count++;
            if ((Educationdata !== null)) {
                final['education'] = Educationdata;
                if ((arrayLen.length === count)) {
                    cb(null, final);
                }
            }
        }
    })
    findRecordofEmploymentHistorybyid(data, function (err, EmploymentHistorydata) {
        if (err) {
            cb(err, null)
        } else {
            count++;
            if ((EmploymentHistorydata !== null)) {

                final['employmenthistory'] = EmploymentHistorydata;
                if ((arrayLen.length === count)) {
                    cb(null, final);
                }
            }
        }
    })
    findRecordofQuestionorybyid(data, function (err, Questionorydata) {
        if (err) {
            cb(err, null)
        } else {
            count++;
            if ((Questionorydata !== null)) {

                final['questionary'] = Questionorydata;
                if ((arrayLen.length === count)) {
                    cb(null, final);
                }
            }
        }
    })
    findRecordofcontinuingeducationbyid(data, function (err, continuingeducationdata) {
        if (err) {
            cb(err, null)
        } else {
            count++;
            if ((continuingeducationdata !== null)) {

                final['continuingeducation'] = continuingeducationdata;
                if ((arrayLen.length === count)) {
                    cb(null, final);
                }
            }
        }
    })
}

const findAllApplicationbyuserid = function (data, cb) {
    if (data.status != 'Submitted') {
        let query = 'SELECT a.createdate, a.userid,a.Applicant_seq,a.idApplication, ap.firstname,ap.lastname,af.formName,af.type as applicationForm_type,a.status,a.createdate, a.scheduleDate, a.comment FROM application a JOIN applicationform af ON a.ApplicationForm_type= af.type JOIN applicant ap ON a.Applicant_seq= ap.seq where a.userid = ?;';
        mysql(query, [data.userid], cb)
    } else {
        let query = 'SELECT a.userid,a.Applicant_seq,a.idApplication,(select firstname from applicant where seq = a.Applicant_seq) as firstname,(select lastname from applicant where seq = a.Applicant_seq)  as lastname,(select formName from applicationform where type = a.ApplicationForm_type)  as formName,(select type from applicationform where type = a.ApplicationForm_type)  as applicationForm_type,a.status,a.createdate, a.scheduleDate, a.comment FROM application a WHERE ? ;';
        mysql(query, [{status: data.status}], cb)
    }
}

const findVerifiedApp = function (cb) {
    let query = 'select a.userid,a.Applicant_seq,a.status as status,a.idApplication as idApplication,(select firstname from applicant where seq = a.Applicant_seq) as firstname,(select lastname from applicant where seq = a.Applicant_seq)  as lastname,(select formName from applicationform where type = a.ApplicationForm_type)  as formName,(select type from applicationform where type = a.ApplicationForm_type)  as applicationForm_type,a.createdate, a.scheduleDate, a.comment from application a where a.status in (\'Verified\',\'Approved\',\'Disapproved\',\'GLB Scheduled\');';
    mysql(query, [], cb)
}

// ====================================================================================================

const updateApplicantQuery = function (body, cb) {
    let arrayLen = ['applicant', 'areaofpractice', 'speciality', 'workhistory', 'education', 'employmenthistory', 'questionary', 'continuingeducation'];
    let finalCount = 0;
    let final = {};
    if (body.data) {
        if (body.data.applicant) {
            const query = `UPDATE applicant SET ? WHERE ? ; select seq, userid, status, firstname, lastname, middlename, email, ssnid, gender, dob, placeofbirth, permanentAddress, permanentAddressCity, permanentAddressState, permanentAddressZip, mailAddress, mailAddressCity, mailAddressZip, mailAddressState, contactHome, contactCell, contactWork, ECFMG, FLEX1, FLEX2, NBME1, NBME2, NBME3, USMLE1, USMLE2, USMLE3, previousfirstname, previouslastname, workcity, workstate, workzip, professionalinformation, areaofpractice, workaddress, medicalLicenseNo, expirationDate, guamRegNo, guamExpirationDate, workGuamLastSixM, currentLicense, medicalSchoolAttended, medicalSchoolState, deaNumber, deaExpirationDate, narcotic1, nonnarcotic1, narcotic2, nonnarcotic2 from applicant where ? ;`;
            let where = [];
            let keys = Object.keys(body.data.applicant);
            let data = {};
            keys.forEach((key) => {
                if (key === 'dob' || key === 'expirationDate' || key === 'deaExpirationDate' || key === 'guamExpirationDate') {
                    body.data.applicant[key] = changeDate(body.data.applicant[key])
                }
                data[key] = body.data.applicant[key]
            })
            where.push(data)
            where.push({seq: body.seq})
            where.push({seq: body.seq})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['applicant'] = data[1];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select seq, userid, status, firstname, lastname, middlename, email, ssnid, gender, dob, placeofbirth, permanentAddress, permanentAddressCity, permanentAddressState, permanentAddressZip, mailAddress, mailAddressCity, mailAddressZip, mailAddressState, contactHome, contactCell, contactWork, ECFMG, FLEX1, FLEX2, NBME1, NBME2, NBME3, USMLE1, USMLE2, USMLE3, previousfirstname, previouslastname, workcity, workstate, workzip, professionalinformation, areaofpractice, workaddress, medicalLicenseNo, expirationDate, guamRegNo, guamExpirationDate, workGuamLastSixM, currentLicense, medicalSchoolAttended, medicalSchoolState, deaNumber, deaExpirationDate, narcotic1, nonnarcotic1, narcotic2, nonnarcotic2 from applicant where ? ;'
            let where = [];
            where.push({seq: body.seq});
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['applicant'] = data[0];

                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
        if ((body.data.speciality) && (body.data.speciality).length > 0 && Object.keys((body.data.speciality)[0]).length !== 0) {
            let query = `delete from speciality where ? and ?; insert into speciality (userid,Applicant_seq,createdby,speciality,dateissued,dateexpired) values `;
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            let count = 0;
            for (let i = 0; i < (body.data.speciality).length; i++) {
                if (Object.keys((body.data.speciality)[i]).length !== 0) {
                    count++;
                }
            }
            let con = 0;
            (body.data.speciality).forEach((speciality) => {
                if (Object.keys(speciality).length !== 0) {
                    con++;
                    if (count === con) {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((speciality.speciality) ? speciality.speciality : '') + '\',\'' + ((speciality.dateissued && speciality.dateissued != '') ? changeDate(speciality.dateissued) : null) + '\',\'' + ((speciality.dateexpired && speciality.dateexpired != '') ? changeDate(speciality.dateexpired) : null) + '\'); select idSpeciality, userid, Applicant_seq, speciality, dateissued, dateexpired from speciality where ? and ?;'
                    } else {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((speciality.speciality) ? speciality.speciality : '') + '\',\'' + ((speciality.dateissued && speciality.dateissued != '') ? changeDate(speciality.dateissued) : null) + '\',\'' + ((speciality.dateexpired && speciality.dateexpired != '') ? changeDate(speciality.dateexpired) : null) + '\'),'
                    }
                }
            })
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['speciality'] = data[2];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select idSpeciality, userid, Applicant_seq, speciality, dateissued, dateexpired from speciality where ? and ? ;'
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['speciality'] = data;
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
        if ((body.data.areaofpractice) && (body.data.areaofpractice).length > 0 && Object.keys((body.data.areaofpractice)[0]).length !== 0) {
            let query = `delete from areaofpractice where ? and ?; INSERT INTO areaofpractice (userid,Applicant_seq,createdby,areaOfPractice,description,date) VALUES `;
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            let count = 0;
            for (let i = 0; i < (body.data.areaofpractice).length; i++) {
                if (Object.keys((body.data.areaofpractice)[i]).length !== 0) {
                    count++;
                }
            }
            let con = 0;
            (body.data.areaofpractice).forEach((AOP) => {
                if (Object.keys(AOP).length !== 0) {
                    con++;
                    if (count === con) {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((AOP.areaOfPractice) ? AOP.areaOfPractice : '') + '\',\'' + ((AOP.description) ? AOP.description : '') + '\',\'' + ((AOP.date) ? changeDate(AOP.date) : null) + '\'); select idAreaOfPractice, userid, Applicant_seq, areaOfPractice, description, date from areaofpractice where ? and ?;'
                    } else {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((AOP.areaOfPractice) ? AOP.areaOfPractice : '') + '\',\'' + ((AOP.description) ? AOP.description : '') + '\',\'' + ((AOP.date) ? changeDate(AOP.date) : null) + '\'),'
                    }
                }
            })
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['areaofpractice'] = data[2];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select idAreaOfPractice, userid, Applicant_seq, areaOfPractice, description, date from areaofpractice where ? and ? ;'
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['areaofpractice'] = data;
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
        if ((body.data.workhistory) && (body.data.workhistory).length > 0 && Object.keys((body.data.workhistory)[0]).length !== 0) {
            let query = `delete from workhistory where ? and ?; INSERT INTO workhistory (userid,Applicant_seq,createdby,fromDate,toDate,location,typeOfPractice,reasonforDiscontinue) VALUES `;
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            let count = 0;
            for (let i = 0; i < (body.data.workhistory).length; i++) {
                if (Object.keys((body.data.workhistory)[i]).length !== 0) {
                    count++;
                }
            }
            let con = 0;
            (body.data.workhistory).forEach((WH) => {
                if (Object.keys(WH).length !== 0) {
                    con++;
                    if (count === con) {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((WH.fromDate) ? changeDate(WH.fromDate) : '') + '\',\'' + ((WH.toDate) ? changeDate(WH.toDate) : '') + '\',\'' + ((WH.location) ? WH.location : '') + '\',\'' + ((WH.typeOfPractice) ? WH.typeOfPractice : '') + '\' ,\'' + ((WH.reasonforDiscontinue) ? WH.reasonforDiscontinue : '') + '\'); select idWorkHistory, userid, Applicant_seq, fromDate, toDate, location, typeOfPractice, reasonforDiscontinue from workhistory where ? and ?;'
                    } else {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((WH.fromDate) ? changeDate(WH.fromDate) : '') + '\',\'' + ((WH.toDate) ? changeDate(WH.toDate) : '') + '\',\'' + ((WH.location) ? WH.location : '') + '\',\'' + ((WH.typeOfPractice) ? WH.typeOfPractice : '') + '\' ,\'' + ((WH.reasonforDiscontinue) ? WH.reasonforDiscontinue : '') + '\'),'
                    }
                }
            })
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['workhistory'] = data[2];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select idWorkHistory, userid, Applicant_seq, fromDate, toDate, location, typeOfPractice, reasonforDiscontinue from workhistory where ? and ?;'
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['workhistory'] = data;
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
        if ((body.data.education) && (body.data.education).length > 0 && Object.keys((body.data.education)[0]).length !== 0) {
            let query = `delete from education where ? and ?; INSERT INTO education (userid,Applicant_seq,createdby,schoolName,address,addressCity,addressState,addressZip,dateEducated,degree,type,photo) VALUES `;
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            let count = 0;
            for (let i = 0; i < (body.data.education).length; i++) {
                if (Object.keys((body.data.education)[i]).length !== 0) {
                    count++;
                }
            }
            let con = 0;
            (body.data.education).forEach((education) => {
                if (Object.keys(education).length !== 0) {
                    con++;
                    if (count === con) {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((education.schoolName) ? education.schoolName : '') + '\',\'' + ((education.address) ? education.address : '') + '\',\'' + ((education.addressCity) ? education.addressCity : '') + '\',\'' + ((education.addressState) ? education.addressState : '') + '\' ,\'' + ((education.addressZip) ? education.addressZip : '') + '\',\'' + ((education.dateEducated) ? changeDate(education.dateEducated) : null) + '\',\'' + ((education.degree) ? education.degree : '') + '\',\'' + ((education.type) ? education.type : '') + '\',\'' + ((education.photo) ? education.photo : '') + '\'); select idEducation, userid, Applicant_seq, schoolName, address, addressCity, addressState, addressZip, dateEducated, degree, type, photo from education where ? and ?;'
                    } else {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((education.schoolName) ? education.schoolName : '') + '\',\'' + ((education.address) ? education.address : '') + '\',\'' + ((education.addressCity) ? education.addressCity : '') + '\',\'' + ((education.addressState) ? education.addressState : '') + '\' ,\'' + ((education.addressZip) ? education.addressZip : '') + '\',\'' + ((education.dateEducated) ? changeDate(education.dateEducated) : null) + '\',\'' + ((education.degree) ? education.degree : '') + '\',\'' + ((education.type) ? education.type : '') + '\',\'' + ((education.photo) ? education.photo : '') + '\'),'
                    }
                }
            })
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['education'] = data[2];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select idEducation, userid, Applicant_seq, schoolName, address, addressCity, addressState, addressZip, dateEducated, degree, type, photo from education where ? and ?;'
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['education'] = data;
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
        if ((body.data.employmenthistory) && (body.data.employmenthistory).length > 0 && Object.keys((body.data.employmenthistory)[0]).length !== 0) {
            let query = `delete from employmenthistory where ? and ?; INSERT INTO employmenthistory (userid,Applicant_seq,createdby,employer,address,date) VALUES `;
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            let count = 0;
            for (let i = 0; i < (body.data.employmenthistory).length; i++) {
                if (Object.keys((body.data.employmenthistory)[i]).length !== 0) {
                    count++;
                }
            }
            let con = 0;
            (body.data.employmenthistory).forEach((EH) => {
                if (Object.keys(EH).length !== 0) {
                    con++;
                    if (count === con) {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((EH.employer) ? EH.employer : '') + '\',\'' + ((EH.address) ? EH.address : '') + '\',\'' + ((EH.date) ? changeDate(EH.date) : null) + '\'); select id, employer, address, date, createdate, Applicant_seq, userid from employmenthistory where ? and ?;'
                    } else {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',\'' + ((EH.employer) ? EH.employer : '') + '\',\'' + ((EH.address) ? EH.address : '') + '\',\'' + ((EH.date) ? changeDate(EH.date) : null) + '\'),'
                    }
                }
            })
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['employmenthistory'] = data[2];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select id, employer, address, date, createdate, Applicant_seq, userid from employmenthistory where ? and ?;'
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['employmenthistory'] = data;
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
        if ((body.data.questionary) && (body.data.questionary).length > 0 && Object.keys((body.data.questionary)[0]).length !== 0) {
            let query = `delete from applicantquestionaire where ? and ?; INSERT INTO applicantquestionaire (userid, Applicant_seq, createdby,Questionaire_questionno, Questionaire_questionDescription , answer, answerdescription, digitalsignature) VALUES `;
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            let count = 0;
            for (let i = 0; i < (body.data.questionary).length; i++) {
                if (Object.keys((body.data.questionary)[i]).length !== 0) {
                    count++;
                }
            }
            let con = 0;
            (body.data.questionary).forEach((questions) => {
                if (Object.keys(questions).length !== 0) {
                    con++;
                    if (count === con) {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',' + questions.questionno + ',\'' + ((questions.questionDescription && questions.questionDescription != '') ? questions.questionDescription : null) + '\',\'' + ((questions.answer) ? questions.answer : '') + '\',\'' + ((questions.answerdescription && questions.answerdescription != '') ? questions.answerdescription : null) + '\',\'' + ((questions.digitalsignature && questions.digitalsignature != '') ? questions.digitalsignature : null) + '\'); select Questionaire_questionno,answer from applicantquestionaire where ? and ?;'
                    } else {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',' + questions.questionno + ',\'' + ((questions.questionDescription && questions.questionDescription != '') ? questions.questionDescription : null) + '\',\'' + ((questions.answer) ? questions.answer : '') + '\',\'' + ((questions.answerdescription && questions.answerdescription != '') ? questions.answerdescription : null) + '\',\'' + ((questions.digitalsignature && questions.digitalsignature != '') ? questions.digitalsignature : null) + '\'),'
                    }
                }
            })
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['questionary'] = data[2];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select Questionaire_questionno,answer from applicantquestionaire where ? and ?;'
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['questionary'] = data;
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
        if ((body.data.continuingeducation) && (body.data.continuingeducation).length > 0 && Object.keys((body.data.continuingeducation)[0]).length !== 0) {
            let query = `delete from continuingeducation where ? and ?; INSERT INTO continuingeducation ( userid, Applicant_seq, createdby, idEducationCategory, coursetitle, sponsoredby, datesattended, accrededapprovedby, credithours) VALUES `;
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            let count = 0;
            for (let i = 0; i < (body.data.continuingeducation).length; i++) {
                if (Object.keys((body.data.continuingeducation)[i]).length !== 0) {
                    count++;
                }
            }
            let con = 0;
            (body.data.continuingeducation).forEach((CE) => {
                if (Object.keys(CE).length !== 0) {
                    con++;
                    if (count === con) {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',' + ((CE.idEducationCategory) ? CE.idEducationCategory : 1) + ',\'' + ((CE.coursetitle) ? CE.coursetitle : null) + '\',\'' + ((CE.sponsoredby) ? CE.sponsoredby : null) + '\',\'' + ((CE.datesattended) ? changeDate(CE.datesattended) : null) + '\',\'' + ((CE.accrededapprovedby) ? CE.accrededapprovedby : null) + '\',\'' + ((CE.credithours) ? CE.credithours : '0') + '\'); select idContinuingEducation, userid, Applicant_seq, idEducationCategory, coursetitle, sponsoredby, datesattended, accrededapprovedby, credithours from continuingeducation where ? and ?;'
                    } else {
                        query += '(' + body.userId + ',' + body.seq + ',' + body.userId + ',' + ((CE.idEducationCategory) ? CE.idEducationCategory : 1) + ',\'' + ((CE.coursetitle) ? CE.coursetitle : null) + '\',\'' + ((CE.sponsoredby) ? CE.sponsoredby : null) + '\',\'' + ((CE.datesattended) ? changeDate(CE.datesattended) : null) + '\',\'' + ((CE.accrededapprovedby) ? CE.accrededapprovedby : null) + '\',\'' + ((CE.credithours) ? CE.credithours : '0') + '\'),'
                    }
                }
            })
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            console.log('continuingeducation query', query);
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['continuingeducation'] = data[2];
                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        } else {
            const query = 'select idContinuingEducation, userid, Applicant_seq, idEducationCategory, coursetitle, sponsoredby, datesattended, accrededapprovedby, credithours from continuingeducation where ? and ?;'
            let where = [];
            where.push({Applicant_seq: body.seq}, {userid: body.userId})
            mysql(query, where, function (err, data) {
                if (err) {
                    cb(err, null)
                } else {
                    finalCount++
                    final['continuingeducation'] = data;

                    if (finalCount === arrayLen.length) {
                        cb(null, final)
                    }
                }
            });
        }
    } /*else {
        const query = ``;
        let where = [];
        where.push({seq: body.seq})
        where.push({Applicant_seq: body.seq}, {userid: body.userId})
        where.push({Applicant_seq: body.seq}, {userid: body.userId})
        where.push({Applicant_seq: body.seq}, {userid: body.userId})
        where.push({Applicant_seq: body.seq}, {userid: body.userId})
        where.push({Applicant_seq: body.seq}, {userid: body.userId})
        mysql(query, where, function (err, data) {
            if (err) {
                cb(err, null)
            } else {
                console.log('data',data.length);
                final['applicant'] = data[0];
                final['speciality'] = data[1];
                final['areaofpractice'] = data[2];
                final['workhistory'] = data[3];
                final['education'] = data[4];
                final['employmenthistory'] = data[5];
                cb(null, final)
            }
        });
    }*/
}

const changestatusofApplication = function (data, cb) {
    let query = 'UPDATE application SET status= ?,createdate = ? , comment = ?, scheduleDate = ? WHERE idApplication = ? ;';
    mysql(query, [data.status, updatedate, data.comment, data.scheduledate, data.idApplication], cb)
}

// ====================================================================================================

const allCategory = function (cb) {
    let query = 'SELECT idEducationCategory as id,Description as description FROM educationcategory';
    mysql(query, [], cb)
}

const findAttachmentList = function (data, cb) {
    if (data.searchType === 'page') {
        let query = 'SELECT ApplicationForm_type, attachmentType, status FROM attachmentrequirements where ApplicationForm_type = ? and status = \'true\';'
        mysql(query, [data.formType], cb)
    } else if (data.searchType === 'user') {
        if (data.role === 'user') {
            let query = 'SELECT idAttachment, userid, Application_idApplication, attachmentType, status, attachmentfilename FROM attachment where Application_idApplication = ? and userid = ? ;'
            mysql(query, [data.idApplication, data.userid], cb)
        } else {
            let query = 'SELECT idAttachment, userid, Application_idApplication, attachmentType, status, attachmentfilename FROM attachment where Application_idApplication = ?;'
            mysql(query, [data.idApplication], cb)
        }
    }
}

const findQuestions = function (formType, cb) {
    let query = 'SELECT * FROM questionaire WHERE formType = ? and status = 0';
    mysql(query, [formType], cb)
}

const findApplicationForReviewer = function (data, cb) {
    if (data.role === 'user') {
        let query = 'select * from application where userid = ? and Applicant_seq = ?';
        mysql(query, [data.userid, data.Applicant_seq,], function (err, application) {
            if (err) {
                cb(err, null)
            } else {
                if (application.length > 0) {
                    let query1 = 'select  Application_sub_form,description,acceptableresult from reviewrequirement where Application_id in(?);'
                    mysql(query1, [application[0].idApplication], function (err, reviewerdata) {
                        if (err) {
                            cb(err, null)
                        } else {
                            let final = {
                                createDate: application[0].createdate,
                                scheduleDate: application[0].scheduleDate,
                                status: application[0].status,
                                reviwer: (reviewerdata.length > 0) ? true : false,
                                forms: reviewerdata,
                                idApplication: application[0].idApplication
                            }
                            cb(null, final)
                        }
                    })
                } else {
                    cb('Application Not Found', null)
                }
            }
        })
    } else {
        let query = 'select * from application where Applicant_seq = ?';
        mysql(query, [data.Applicant_seq,], cb)

    }
}

const findallactivity = function (data, cb) {
    if (isNullOrUndefined(data.idApplication)) {
        if (data.role === 'user') {
            let query = 'select * from applicationreview where userid = ? order by createddate DESC';
            mysql(query, [data.userid, data.Applicant_seq,], function (err, application) {
                if (err) {
                    cb(err, null)
                } else {
                    if (application.length > 0) {
                        let query1 = 'select  Application_sub_form,description,acceptableresult from reviewrequirement where Application_id in(?);'
                        mysql(query1, [application[0].idApplication], function (err, reviewerdata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                let final = {
                                    createDate: application[0].createdate,
                                    scheduleDate: application[0].scheduleDate,
                                    status: application[0].status,
                                    reviwer: (reviewerdata.length > 0) ? true : false,
                                    forms: reviewerdata,
                                    idApplication: application[0].idApplication
                                }
                                cb(null, final)
                            }
                        })
                    } else {
                        cb('Application Not Found', null)
                    }
                }
            })
        } else {
            let query = 'select * from applicationreview order by createddate DESC';
            mysql(query, [], cb)

        }
    } else {
        if (data.role === 'user') {
            let query = 'select * from applicationreview where userid = ? order by createddate DESC';
            mysql(query, [data.userid, data.Applicant_seq,], function (err, application) {
                if (err) {
                    cb(err, null)
                } else {
                    if (application.length > 0) {
                        let query1 = 'select  Application_sub_form,description,acceptableresult from reviewrequirement where Application_id in(?);'
                        mysql(query1, [application[0].idApplication], function (err, reviewerdata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                let final = {
                                    createDate: application[0].createdate,
                                    scheduleDate: application[0].scheduleDate,
                                    status: application[0].status,
                                    reviwer: (reviewerdata.length > 0) ? true : false,
                                    forms: reviewerdata,
                                    idApplication: application[0].idApplication
                                }
                                cb(null, final)
                            }
                        })
                    } else {
                        cb('Application Not Found', null)
                    }
                }
            })
        } else {
            let query = 'select * from applicationreview where idApplication = ? order by createddate DESC';
            mysql(query, [data.idApplication], cb)

        }
    }
}

// ====================================================================================================

const insertApplicantQuery = function (validateData, cb) {
    const query = `INSERT INTO applicant SET ?`;
    let where = [];
    let data = {userid: validateData.userId}
    if (!(Object.keys(validateData.data).length === 0 && (validateData.data).constructor === Object)) {
        if (validateData.data.applicant) {
            let keys = Object.keys(validateData.data.applicant);
            keys.forEach((key) => {
                if (key === 'dob' || key === 'expirationDate' || key === 'deaExpirationDate' || key === 'guamExpirationDate') {
                    validateData.data.applicant[key] = changeDate(validateData.data.applicant[key]);
                }
                data[key] = validateData.data.applicant[key]
            })
            where.push(data)
        } else {
            where.push(data);
        }
    } else {
        where.push(data);
    }
    mysql(query, where, function (err, data) {
        if (err) {
            cb(err, null)
        } else {
            let seq = data.insertId;
            if (validateData.data) {
                if (validateData.data.applicant) {
                    delete validateData.data['applicant'];
                }
                if (Object.keys(validateData.data).length !== 0) {
                    let count = 0;
                    if ((validateData.data.areaofpractice) && Object.keys(validateData.data.areaofpractice).length !== 0 && Object.keys((validateData.data.areaofpractice)[0]).length !== 0) {
                        validateData.data.areaofpractice['userid'] = validateData.userId
                        validateData.data.areaofpractice['Applicant_seq'] = seq
                        insertAreaofPracticeQuery(validateData.data.areaofpractice, function (err, areaofpracticedata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                count++;
                                if (count === Object.keys(validateData.data).length) {
                                    cb(null, data)
                                }
                            }
                        })
                    } else {
                        count++;
                        if (count === Object.keys(validateData.data).length) {
                            cb(null, data)
                        }
                    }
                    if ((validateData.data.speciality) && Object.keys(validateData.data.speciality).length !== 0 && Object.keys((validateData.data.speciality)[0]).length !== 0) {
                        validateData.data.speciality['userid'] = validateData.userId
                        validateData.data.speciality['Applicant_seq'] = seq
                        insertSpecialityQuery(validateData.data.speciality, function (err, specialitydata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                count++;
                                if (count === Object.keys(validateData.data).length) {
                                    cb(null, data)
                                }
                            }
                        })
                    } else {
                        count++;
                        if (count === Object.keys(validateData.data).length) {
                            cb(null, data)
                        }
                    }
                    if ((validateData.data.workhistory) && Object.keys(validateData.data.workhistory).length !== 0 && Object.keys((validateData.data.workhistory)[0]).length !== 0) {
                        validateData.data.workhistory['userid'] = validateData.userId
                        validateData.data.workhistory['Applicant_seq'] = seq
                        insertWorkHistoryQuery(validateData.data.workhistory, function (err, WorkHistorydata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                count++;
                                if (count === Object.keys(validateData.data).length) {
                                    cb(null, data)
                                }
                            }
                        })
                    } else {
                        count++;
                        if (count === Object.keys(validateData.data).length) {
                            cb(null, data)
                        }
                    }
                    if ((validateData.data.education) && Object.keys(validateData.data.education).length !== 0 && Object.keys((validateData.data.education)[0]).length !== 0) {
                        validateData.data.education['userid'] = validateData.userId
                        validateData.data.education['Applicant_seq'] = seq
                        insertEducationQuery(validateData.data.education, function (err, Educationdata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                count++;
                                if (count === Object.keys(validateData.data).length) {
                                    cb(null, data)
                                }
                            }
                        })
                    } else {
                        count++;
                        if (count === Object.keys(validateData.data).length) {
                            cb(null, data)
                        }
                    }
                    if ((validateData.data.employmenthistory) && Object.keys(validateData.data.employmenthistory).length !== 0 && Object.keys((validateData.data.employmenthistory)[0]).length !== 0) {
                        validateData.data.employmenthistory['userid'] = validateData.userId
                        validateData.data.employmenthistory['Applicant_seq'] = seq
                        insertemployerhistoryQuery(validateData.data.employmenthistory, function (err, employmenthistorydata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                count++;
                                if (count === Object.keys(validateData.data).length) {
                                    cb(null, data)
                                }
                            }
                        })
                    } else {
                        count++;
                        if (count === Object.keys(validateData.data).length) {
                            cb(null, data)
                        }
                    }
                    if ((validateData.data.questionary) && Object.keys(validateData.data.questionary).length !== 0 && Object.keys((validateData.data.questionary)[0]).length !== 0) {
                        validateData.data.questionary['userid'] = validateData.userId
                        validateData.data.questionary['Applicant_seq'] = seq
                        inserQuestionaryQuery(validateData.data.questionary, function (err, Questionarydata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                count++;
                                if (count === Object.keys(validateData.data).length) {
                                    cb(null, data)
                                }
                            }
                        })
                    } else {
                        count++;
                        if (count === Object.keys(validateData.data).length) {
                            cb(null, data)
                        }
                    }
                    if ((validateData.data.continuingeducation) && Object.keys(validateData.data.continuingeducation).length !== 0 && Object.keys((validateData.data.continuingeducation)[0]).length !== 0) {
                        validateData.data.continuingeducation['userid'] = validateData.userId
                        validateData.data.continuingeducation['Applicant_seq'] = seq
                        insertcontinuingeducationQuery(validateData.data.continuingeducation, function (err, continuingeducationdata) {
                            if (err) {
                                cb(err, null)
                            } else {
                                count++;
                                if (count === Object.keys(validateData.data).length) {
                                    cb(null, data)
                                }
                            }
                        })
                    } else {
                        count++;
                        if (count === Object.keys(validateData.data).length) {
                            cb(null, data)
                        }
                    }
                } else {
                    cb(null, data)
                }
            } else {
                cb(null, data)
            }
        }
    });
}

const insertApplicationQuery = function (data, cb) {
    const query = `INSERT INTO application SET ?`;
    let where = [];
    let val = {
        userid: data.userid,
        status: 'Draft',
        Applicant_seq: data.seq,
        ApplicationForm_type: data.formType,
        createdby: data.userid
    }
    where.push(val);
    mysql(query, where, cb);
}

const insertAreaofPracticeQuery = function (data, cb) {
    let query = `INSERT INTO areaofpractice (userid,Applicant_seq,createdby,areaOfPractice,description,date) VALUES`;
    let count = 0;
    for (let i = 0; i < data.length; i++) {
        if (Object.keys(data[i]).length !== 0) {
            count++;
        }
    }
    let con = 0;
    data.forEach((AOP) => {
        if (Object.keys(AOP).length !== 0) {
            con++;
            if (count === con) {
                query += '(' + data.userid + ',' + data.Applicant_seq + ',' + data.userid + ',\'' + ((AOP.areaOfPractice) ? AOP.areaOfPractice : '') + '\',\'' + ((AOP.description) ? AOP.description : '') + '\',\'' + ((AOP.date) ? changeDate(AOP.date) : null) + '\')'
            } else {
                query += '(' + data.userid + ',' + data.Applicant_seq + ',' + data.userid + ',\'' + ((AOP.areaOfPractice) ? AOP.areaOfPractice : '') + '\',\'' + ((AOP.description) ? AOP.description : '') + '\',\'' + ((AOP.date) ? changeDate(AOP.date) : null) + '\'),'
            }
        }
    })
    try {
        mysql(query, [], cb);
    } catch (e) {
        cb(e, null);
    }
}

const insertemployerhistoryQuery = function (data, cb) {
    let query = `INSERT INTO employmenthistory (userid,Applicant_seq,createdby,employer,address,date) VALUES`;
    let count = 0;
    for (let i = 0; i < data.length; i++) {
        if (Object.keys(data[i]).length !== 0) {
            count++;
        }
    }
    let con = 0;
    data.forEach((EH) => {
        if (Object.keys(EH).length !== 0) {
            con++;
            if (count === con) {
                query += '(' + data.userid + ',' + data.Applicant_seq + ',' + data.userid + ',\'' + ((EH.employer) ? EH.employer : '') + '\',\'' + ((EH.address) ? EH.address : '') + '\',\'' + ((EH.date) ? changeDate(EH.date) : null) + '\')'
            } else {
                query += '(' + data.userid + ',' + data.Applicant_seq + ',' + data.userid + ',\'' + ((EH.employer) ? EH.employer : '') + '\',\'' + ((EH.address) ? EH.address : '') + '\',\'' + ((EH.date) ? changeDate(EH.date) : null) + '\'),'
            }
        }
    })
    try {
        mysql(query, [], cb);
    } catch (e) {
        cb(e, null);
    }
}

const insertSpecialityQuery = function (body, cb) {
    let query = `INSERT INTO speciality (userid,Applicant_seq,createdby,speciality,dateissued,dateexpired) VALUES `;
    let count = 0;
    for (let i = 0; i < body.length; i++) {
        if (Object.keys(body[i]).length !== 0) {
            count++;
        }
    }
    let con = 0;
    body.forEach((speciality) => {
        if (Object.keys(speciality).length !== 0) {
            con++;
            if (count === con) {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',\'' + ((speciality.speciality) ? speciality.speciality : '') + '\',\'' + ((speciality.dateissued) ? changeDate(speciality.dateissued) : null) + '\',\'' + ((speciality.dateexpired) ? changeDate(speciality.dateexpired) : null) + '\')'
            } else {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',\'' + ((speciality.speciality) ? speciality.speciality : '') + '\',\'' + ((speciality.dateissued) ? changeDate(speciality.dateissued) : null) + '\',\'' + ((speciality.dateexpired) ? changeDate(speciality.dateexpired) : null) + '\'),'
            }
        }
    })
    try {
        mysql(query, [], cb);
    } catch (e) {
        cb(e, null);
    }
}

const insertWorkHistoryQuery = function (body, cb) {
    let query = `INSERT INTO workhistory (userid,Applicant_seq,createdby,fromDate,toDate,location,typeOfPractice,reasonforDiscontinue) VALUES `;
    let count = 0;
    for (let i = 0; i < body.length; i++) {
        if (Object.keys(body[i]).length !== 0) {
            count++;
        }
    }
    let con = 0;
    body.forEach((WH) => {
        if (Object.keys(WH).length !== 0) {
            con++;
            if (count === con) {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',\'' + ((WH.fromDate) ? changeDate(WH.fromDate) : '') + '\',\'' + ((WH.toDate) ? changeDate(WH.toDate) : '') + '\',\'' + ((WH.location) ? WH.location : '') + '\',\'' + ((WH.typeOfPractice) ? WH.typeOfPractice : '') + '\' ,\'' + ((WH.reasonforDiscontinue) ? WH.reasonforDiscontinue : '') + '\')'
            } else {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',\'' + ((WH.fromDate) ? changeDate(WH.fromDate) : '') + '\',\'' + ((WH.toDate) ? changeDate(WH.toDate) : '') + '\',\'' + ((WH.location) ? WH.location : '') + '\',\'' + ((WH.typeOfPractice) ? WH.typeOfPractice : '') + '\' ,\'' + ((WH.reasonforDiscontinue) ? WH.reasonforDiscontinue : '') + '\'),'
            }
        }
    })
    try {
        mysql(query, [], cb);
    } catch (e) {
        cb(e, null);
    }
}

const insertEducationQuery = function (body, cb) {
    let query = `INSERT INTO education (userid,Applicant_seq,createdby,schoolName,address,addressCity,addressState,addressZip,dateEducated,degree,type,photo) VALUES `;
    let count = 0;
    for (let i = 0; i < body.length; i++) {
        if (Object.keys(body[i]).length !== 0) {
            count++;
        }
    }
    let con = 0;
    body.forEach((education) => {
        if (Object.keys(education).length !== 0) {
            con++;
            if (count === con) {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',\'' + ((education.schoolName) ? education.schoolName : '') + '\',\'' + ((education.address) ? education.address : '') + '\',\'' + ((education.addressCity) ? education.addressCity : '') + '\',\'' + ((education.addressState) ? education.addressState : '') + '\' ,\'' + ((education.addressZip) ? education.addressZip : '') + '\',\'' + ((education.dateEducated) ? changeDate(education.dateEducated) : null) + '\',\'' + ((education.degree) ? education.degree : '') + '\',\'' + ((education.type) ? education.type : '') + '\',\'' + ((education.photo) ? education.photo : '') + '\')'
            } else {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',\'' + ((education.schoolName) ? education.schoolName : '') + '\',\'' + ((education.address) ? education.address : '') + '\',\'' + ((education.addressCity) ? education.addressCity : '') + '\',\'' + ((education.addressState) ? education.addressState : '') + '\' ,\'' + ((education.addressZip) ? education.addressZip : '') + '\',\'' + ((education.dateEducated) ? changeDate(education.dateEducated) : null) + '\',\'' + ((education.degree) ? education.degree : '') + '\',\'' + ((education.type) ? education.type : '') + '\',\'' + ((education.photo) ? education.photo : '') + '\'),'
            }
        }
    })
    try {
        mysql(query, [], cb);
    } catch (e) {
        cb(e, null);
    }
}

const inserQuestionaryQuery = function (body, cb) {
    let query = `INSERT INTO applicantquestionaire (userid, Applicant_seq, createdby,Questionaire_questionno, Questionaire_questionDescription , answer, answerdescription, digitalsignature) VALUES `;
    let count = 0;
    for (let i = 0; i < body.length; i++) {
        if (Object.keys(body[i]).length !== 0) {
            count++;
        }
    }
    let con = 0;
    body.forEach((questions) => {
        if (Object.keys(questions).length !== 0) {
            con++;
            if (count === con) {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',' + questions.questionno + ',\'' + ((questions.questionDescription) ? questions.questionDescription : null) + '\',\'' + ((questions.answer) ? questions.answer : '') + '\',\'' + ((questions.answerdescription) ? questions.answerdescription : null) + '\',\'' + ((questions.digitalsignature) ? questions.digitalsignature : null) + '\')'
            } else {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',' + questions.questionno + ',\'' + ((questions.questionDescription) ? questions.questionDescription : null) + '\',\'' + ((questions.answer) ? questions.answer : '') + '\',\'' + ((questions.answerdescription) ? questions.answerdescription : null) + '\',\'' + ((questions.digitalsignature) ? questions.digitalsignature : null) + '\'),'
            }
        }
    })
    try {
        mysql(query, [], cb);
    } catch (e) {
        cb(e, null);
    }
}

const insertcontinuingeducationQuery = function (body, cb) {
    let query = `INSERT INTO continuingeducation ( userid, Applicant_seq, createdby, idEducationCategory, coursetitle, sponsoredby, datesattended, accrededapprovedby, credithours) VALUES `;
    let count = 0;
    for (let i = 0; i < body.length; i++) {
        if (Object.keys(body[i]).length !== 0) {
            count++;
        }
    }
    let con = 0;
    body.forEach((CE) => {
        if (Object.keys(CE).length !== 0) {
            con++;
            if (count === con) {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',' + ((CE.idEducationCategory) ? CE.idEducationCategory : 1) + ',\'' + ((CE.coursetitle) ? CE.coursetitle : null) + '\',\'' + ((CE.sponsoredby) ? CE.sponsoredby : null) + '\',\'' + ((CE.datesattended) ? changeDate(CE.datesattended) : null) + '\',\'' + ((CE.accrededapprovedby) ? CE.accrededapprovedby : null) + '\',\'' + ((CE.credithours) ? CE.credithours : '0') + '\')'
            } else {
                query += '(' + body.userid + ',' + body.Applicant_seq + ',' + body.userid + ',' + ((CE.idEducationCategory) ? CE.idEducationCategory : 1) + ',\'' + ((CE.coursetitle) ? CE.coursetitle : null) + '\',\'' + ((CE.sponsoredby) ? CE.sponsoredby : null) + '\',\'' + ((CE.datesattended) ? changeDate(CE.datesattended) : null) + '\',\'' + ((CE.accrededapprovedby) ? CE.accrededapprovedby : null) + '\',\'' + ((CE.credithours) ? CE.credithours : '0') + '\'),'
            }
        }
    })
    try {
        console.log('continuingeducation query', query);
        mysql(query, [], cb);
    } catch (e) {
        cb(e, null);
    }
}

const insertReviwerRequirementQuery = function (body, cb) {
    let query = `delete from reviewrequirement where ? ; INSERT INTO reviewrequirement (Application_id, ApplicationForm_type, Application_sub_form, acceptableresult, description, review) VALUES  `;
    let con = 0;
    let count = 0;
    for (let i = 0; i < body.data.length; i++) {
        if (Object.keys(body.data[i]).length !== 0) {
            count++;
        }
    }
    (body.data).forEach((review) => {
        con++;
        (review.acceptableresult) = (review.acceptableresult) ? (review.acceptableresult) : '';
        if (count === con) {
            query += '(' + body.applicationid + ',' + body.ApplicationForm_type + ',\'' + review.subForm + '\',\'' + (review.acceptableresult).toUpperCase() + '\',\'' + ((review.description) ? review.description : ' ') + '\',' + ((review.review) ? review.review : null) + ')'
        } else {
            query += '(' + body.applicationid + ',' + body.ApplicationForm_type + ',\'' + review.subForm + '\',\'' + (review.acceptableresult).toUpperCase() + '\',\'' + ((review.description) ? review.description : ' ') + '\',' + ((review.review) ? review.review : null) + '), '
        }
    })
    try {
        mysql(query, [{Application_id: body.applicationid}], function (err, reviewData) {
            if (err) {
                cb(err, null)
            } else {
                let lastData = (body.data).filter((x) => {
                    return (((x.acceptableresult) ? (x.acceptableresult).toUpperCase() : '') === "NO" || ((x.acceptableresult) ? (x.acceptableresult).toUpperCase() : '') === "NA")
                })
                if (lastData.length > 0) {
                    let updateDataforchangestatus = {
                        appid: body.applicationid,
                        status: 'Draft',
                    }
                    changeStatus(updateDataforchangestatus, function (err, updateStatusData) {
                        if (err) {
                            cb(err, null)
                        } else {
                            let logbody = {
                                userid: body.userid,
                                idApplication: body.applicationid,
                                status: 'Draft',
                                comment: ' ',
                                description: ' ',
                                createdBy: body.createdBy,
                            }
                            insertapplicationreview(logbody, function (err, finalData) {
                                if (err) {
                                    cb(err, null)
                                } else {
                                    let final = {
                                        status: "pending",
                                        message: "This application is not verified",
                                        Application_id: body.applicationid,
                                    }
                                    cb(null, final)
                                }
                            })
                        }
                    })
                } else {
                    let query1 = 'UPDATE application SET status=\'Verified\', createdate = ? WHERE idApplication = ?  ; '
                    try {
                        mysql(query1, [updatedate, body.applicationid], function (err, updateStatusData) {
                            if (err) {
                                cb(err, null)
                            } else {
                                let logbody = {
                                    userid: body.userid,
                                    idApplication: body.applicationid,
                                    status: 'Verified',
                                    comment: ' ',
                                    description: ' ',
                                    createdBy: body.createdBy,
                                }
                                insertapplicationreview(logbody, function (err, finalData) {
                                    if (err) {
                                        cb(err, null)
                                    } else {
                                        let final = {
                                            status: "verified",
                                            message: "This application is verified",
                                            Application_id: body.applicationid,
                                        }
                                        cb(null, final)
                                    }
                                })
                            }
                        })
                    } catch (errr) {
                        cb(errr, null);
                    }
                }
            }
        });
    } catch (e) {
        cb(e, null);
    }
}

const insertAttachement = function (body, cb) {
    let query = `delete from attachment where ? and ? and ?; INSERT INTO attachment SET ?  `;
    try {
        mysql(query, [{userid: body.userid}, {attachmentType: body.attachmentType}, {Application_idApplication: body.Application_idApplication}, body], cb)
    } catch (e) {
        cb(e, null)
    }
}

const insertapplicationreview = function (body, cb) {
    let query = `INSERT INTO applicationreview SET ?  `;
    try {
        mysql(query, [body], cb)
    } catch (e) {
        cb(e, null)
    }
}

// ====================================================================================================

const changeDate = function (date) {
    if (typeof date === 'object' && (date != null && date != ' ')) {
        date = date.toISOString();
    }
    if ((date != null && date != ' ')) {
        date = date.replace("T", " ");
        date = date.replace("Z", " ");
        return date;
    } else {
        return null;
    }
}

const changeStatus = function (body, cb) {
    if (body.status === 'Submitted') {
        let query = 'UPDATE application SET status=\'Submitted\',createdate = ? WHERE ? ;';
        try {
            mysql(query, [updatedate, {idApplication: body.appid}], function (err, updateData) {
                if (err) {
                    cb(err, null)
                } else {
                    if (updateData.affectedRows != 0) {
                        cb(null, "Status Change Successfully")
                    } else {
                        cb('No Update', null)
                    }
                }
            })
        } catch (e) {
            cb(e, null);
        }
    } else if (body.status === 'Draft') {
        let query = 'UPDATE application SET status=\'Draft\', createdate = ? WHERE ? ;';
        try {
            mysql(query, [updatedate, {idApplication: body.appid}], function (err, updateData) {
                if (err) {
                    cb(err, null)
                } else {
                    if (updateData.affectedRows != 0) {
                        cb(null, "Status Change Successfully")
                    } else {
                        cb('No Update', null)
                    }
                }
            })
        } catch (e) {
            cb(e, null);
        }
    }
}

const filterdata = function (finalData) {
    let newCount = 0;
    let len = Object.keys(finalData).length;
    for (let i = 0; i < len; i++) {
        if (Object.keys(finalData[Object.keys(finalData)[i]]).length !== 0) {
            newCount++;
        }
    }
    //let count = 0;
    let data = {};
    if (Object.keys(finalData['applicant']).length != 0) {
        let abc = {};
        finalData['applicant'].forEach(function (x) {
            delete x.seq;
            delete x.userid;
            delete x.createdate;
            delete x.createdby;
            delete x.updatedate;
            abc = x;
        })
        data['applicant'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = {};
        data['applicant'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
    if (Object.keys(finalData['speciality']).length != 0) {
        let abc = [];
        finalData['speciality'].forEach(function (x) {
            delete x.idSpeciality;
            delete x.userid;
            delete x.Applicant_seq;
            delete x.createdate;
            delete x.createdby;
            abc.push(x);
        })
        data['speciality'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = [];
        data['speciality'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
    if (Object.keys(finalData['areaofpractice']).length != 0) {
        let abc = [];
        finalData['areaofpractice'].forEach(function (x) {
            delete x.idSpeciality;
            delete x.userid;
            delete x.Applicant_seq;
            delete x.createdate;
            delete x.createdby;
            abc.push(x);
        })
        data['areaofpractice'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = [];
        data['areaofpractice'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
    if (Object.keys(finalData['workhistory']).length != 0) {
        let abc = [];
        finalData['workhistory'].forEach(function (x) {
            delete x.idWorkHistory;
            delete x.userid;
            delete x.Applicant_seq;
            delete x.createdate;
            delete x.createdby;
            abc.push(x);
        })
        data['workhistory'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = [];
        data['workhistory'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
    if (Object.keys(finalData['education']).length != 0) {
        let abc = [];
        finalData['education'].forEach(function (x) {
            delete x.idEducation;
            delete x.userid;
            delete x.Applicant_seq;
            delete x.createdate;
            delete x.createdby;
            abc.push(x);
        })
        data['education'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = [];
        data['education'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
    if (Object.keys(finalData['employmenthistory']).length != 0) {
        let abc = [];
        finalData['employmenthistory'].forEach(function (x) {
            delete x.idContinuingEducation;
            delete x.userid;
            delete x.Applicant_seq;
            delete x.createdate;
            delete x.createdby;
            abc.push(x);
        })
        data['employmenthistory'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = [];
        data['employmenthistory'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
    if (Object.keys(finalData['continuingeducation']).length != 0) {
        let abc = [];
        finalData['continuingeducation'].forEach(function (x) {
            delete x.idContinuingEducation;
            delete x.userid;
            delete x.Applicant_seq;
            delete x.createdate;
            delete x.createdby;
            abc.push(x);
        })
        data['continuingeducation'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = [];
        data['continuingeducation'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
    if (Object.keys(finalData['questionary']).length != 0) {
        let abc = [];
        finalData['questionary'].forEach(function (x) {
            delete x.idContinuingEducation;
            delete x.userid;
            delete x.Applicant_seq;
            delete x.createdate;
            delete x.createdby;
            x['questionno'] = x.Questionaire_questionno;
            delete x.Questionaire_questionno;
            abc.push(x);
        })
        data['questionary'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    } else {
        let abc = [];
        data['questionary'] = abc;
        if (Object.keys(data).length === len) {
            return data
        }
    }
}

// ====================================================================================================
exports.findUserbyId = function (req, res) {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        sub: decodedJwt.payload.sub,
    }
    const query = `Select * from users where ?`;
    let where = [{
        global_id: data.sub,
    }];
    try {
        mysql(query, where[0], function (err, userData) {
            if (err) {
                res.status(400).send(err)
            } else {

                res.status(200).send(userData)

            }
        });
    } catch (e) {
        cb(e, null);
    }
}

const findUserbyGlobalId = function (data, cb) {
    const query = `Select * from users where ?`;
    let where = [{
        global_id: data.sub,
    }];
    try {
        mysql(query, where[0], function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                if (userData.length <= 0) {
                    insertUserQuery(data, function (err, insertUser) {
                        if (err) {
                            errorResponse.queryError(err, function (data) {
                                cb(data, null)
                            })
                        } else {
                            cb(null, insertUser.insertId)
                        }
                    })
                } else {
                    cb(null, userData[0].id)
                }
            }
        });
    } catch (e) {
        cb(e, null);
    }
}

const finduserbyuserid = function (userid, cb) {
    const query = `Select * from users where id = ?`;
    try {
        mysql(query, userid, function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                cb(null, userData)
            }
        });
    } catch (e) {
        cb(e, null);
    }
}

const insertUserQuery = function (data, cb) {
    // const query = 'INSERT INTO users (username,global_id,role,gender,phoneNumber,middleName,firstName,address,password) VALUES ('+data.email.toString() +','+ data.sub.toString()+','+ data.role.toString()+','+ data.gender.toString()+','+ data.phoneNumber.toString()+','+ data.middleName.toString()+','+ data.firstName.toString()+','+ data.address.toString()+','+data.password.toString()+')';
    const query = `INSERT INTO users SET ?`;
    let where = [{
        username: data.email,
        password: (data.password) ? data.password : '',
        global_id: data.sub,
        role: data.role,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        middleName: data.middleName,
        firstName: data.firstName,
        address: data.address
    }];
    try {
        mysql(query, where[0], cb);
    } catch (e) {
        cb(e, null);
    }
}


exports.UpdateUserIsConfirmQuery = function (data, cb) {
    const query = 'UPDATE users SET isConfirm="true" Where global_id=' + '\'' + data.sub + '\'';

    let where = [{
        username: data.email,
        global_id: data.sub,
    }];
    try {
        mysql(query, where[0], cb);
    } catch (e) {
        cb(e, null);
    }
}

exports.UpdateUserProfile = function (data, cb) {
    let query = 'UPDATE users SET username= ?,gender = ?, phoneNumber = ?, firstName = ?, address = ?  WHERE global_id = ? ;';
    try {
        mysql(query, [data.email, data.gender, data.phoneNo, data.familyName, data.address, data.userID], cb)
    } catch (e) {
        cb(e, null);
    }
}

exports.createuser = (req, cb) => {
    findUserbyGlobalId(req, function (err, userid) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                cb(null, data)
            })
        } else {
            cb(null, userid)
        }
    })
}

exports.autosave = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            req.body['userId'] = userId;
            validate.userGetdata(req.body, function (err, validateData) {
                if (err) {
                    errorResponse.missingParams(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    findApplicationQuery(validateData, function (err, applicationData) {
                        if (err) {
                            errorResponse.queryError(error, function (data) {
                                res.status(500).send(data)
                            })
                        } else {
                            if (applicationData.length === 0) {
                                insertApplicantQuery(validateData, function (err, insertApplicantdata) {
                                    if (err) {
                                        errorResponse.queryError(err, function (data) {
                                            res.status(500).send(data)
                                        })
                                    } else {
                                        if (insertApplicantdata.insertId != 0) {
                                            let send = {
                                                userid: validateData.userId,
                                                Applicant_seq: insertApplicantdata.insertId,
                                                role: role
                                            }
                                            findApplicantQuerybySeqandUserId(send, function (err, applicantData) {
                                                if (err) {
                                                    errorResponse.queryError(error, function (data) {
                                                        res.status(500).send(data)
                                                    })
                                                } else {
                                                    let senderData = {
                                                        userid: validateData.userId,
                                                        formType: validateData.formType,
                                                        seq: insertApplicantdata.insertId
                                                    };
                                                    insertApplicationQuery(senderData, function (err, insertApplicationData) {
                                                        if (err) {
                                                            errorResponse.queryError(err, function (data) {
                                                                res.status(500).send(data)
                                                            })
                                                        } else {
                                                            if (insertApplicationData.insertId != 0) {
                                                                validateData['seq'] = insertApplicantdata.insertId;
                                                                findSubTableData(validateData, function (err, finalData) {
                                                                    if (err) {
                                                                        errorResponse.queryError(err, function (data) {
                                                                            res.status(500).send(data)
                                                                        })
                                                                    } else {
                                                                        let final = {
                                                                            applicationid: insertApplicationData.insertId,
                                                                            applicant: applicantData[0],
                                                                            areaofpractice: finalData['areaofpractice'] ? finalData['areaofpractice'] : {},
                                                                            speciality: finalData['speciality'] ? finalData['speciality'] : {},
                                                                            workhistory: finalData['workhistory'] ? finalData['workhistory'] : {},
                                                                            education: finalData['education'] ? finalData['education'] : {},
                                                                            employmenthistory: finalData['employmenthistory'] ? finalData['employmenthistory'] : {},
                                                                            questionary: finalData['questionary'] ? finalData['questionary'] : {},
                                                                            continuingeducation: finalData['continuingeducation'] ? finalData['continuingeducation'] : {},
                                                                        }
                                                                        res.status(200).send(final);
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                })
                            } else {
                                if (!(isNullOrUndefined(validateData.data))) {
                                    validateData['seq'] = applicationData[0].Applicant_seq
                                    updateApplicantQuery(validateData, function (err, updatdata) {
                                        if (err) {
                                            errorResponse.queryError(err, function (data) {
                                                res.status(500).send(data)
                                            })
                                        } else {
                                            let final = {
                                                applicationid: applicationData[0].idApplication,
                                                applicant: updatdata['applicant'] ? updatdata['applicant'] : {},
                                                areaofpractice: updatdata['areaofpractice'] ? updatdata['areaofpractice'] : {},
                                                speciality: updatdata['speciality'] ? updatdata['speciality'] : {},
                                                workhistory: updatdata['workhistory'] ? updatdata['workhistory'] : {},
                                                education: updatdata['education'] ? updatdata['education'] : {},
                                                employmenthistory: updatdata['employmenthistory'] ? updatdata['employmenthistory'] : {},
                                                questionary: updatdata['questionary'] ? updatdata['questionary'] : {},
                                                continuingeducation: updatdata['continuingeducation'] ? updatdata['continuingeducation'] : {},
                                            }
                                            res.status(200).send(final);

                                        }
                                    })
                                } else {
                                    applicationData[0]['role'] = role;
                                    findApplicantQuerybySeqandUserId(applicationData[0], function (err, applicantData) {
                                        if (err) {
                                            errorResponse.queryError(err, function (data) {
                                                res.status(500).send(data)
                                            })
                                        } else {
                                            validateData['seq'] = applicationData[0].Applicant_seq;
                                            findSubTableData(validateData, function (err, finalData) {
                                                if (err) {
                                                    errorResponse.queryError(error, function (data) {
                                                        res.status(500).send(data)
                                                    })
                                                } else {
                                                    let final = {
                                                        applicationid: applicationData[0].idApplication,
                                                        applicant: applicantData,
                                                        areaofpractice: finalData['areaofpractice'] ? finalData['areaofpractice'] : {},
                                                        speciality: finalData['speciality'] ? finalData['speciality'] : {},
                                                        workhistory: finalData['workhistory'] ? finalData['workhistory'] : {},
                                                        education: finalData['education'] ? finalData['education'] : {},
                                                        employmenthistory: finalData['employmenthistory'] ? finalData['employmenthistory'] : {},
                                                        questionary: finalData['questionary'] ? finalData['questionary'] : {},
                                                        continuingeducation: finalData['continuingeducation'] ? finalData['continuingeducation'] : {},
                                                    }
                                                    res.status(200).send(final);
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        }
                    })
                }
            })
        }
    })
}

exports.getApplicationbyid = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let role = decodedJwt.payload['custom:role'];
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let seq = req.query.seq;
    if (role.toLowerCase() === 'user' || role.toLowerCase() === 'admin') {
        findUserbyGlobalId(data, function (err, userId) {
            if (err) {
                errorResponse.queryError(err, function (data) {
                    res.status(400).send(data)
                })
            } else {
                let userData = {
                    userid: userId,
                    Applicant_seq: seq,
                    role: role.toLowerCase()
                }
                findApplicationForReviewer(userData, function (err, reviewerData) {
                    if (err) {
                        errorResponse.queryError(err, function (data) {
                            res.status(400).send(data)
                        })
                    } else {
                        findApplicantQuerybySeqandUserId(userData, function (err, applicantData) {
                            if (err) {
                                errorResponse.queryError(err, function (data) {
                                    res.status(400).send(data)
                                })
                            } else {
                                let search = {
                                    userId: applicantData[0].userid,
                                    seq: seq,
                                    role: role.toLowerCase()
                                }
                                findSubTableData(search, function (err, finalData) {
                                    if (err) {
                                        errorResponse.queryError(err, function (data) {
                                            res.status(400).send(data)
                                        })
                                    } else {
                                        let final = {
                                            applicant: applicantData[0],
                                            areaofpractice: finalData['areaofpractice'] ? finalData['areaofpractice'] : {},
                                            speciality: finalData['speciality'] ? finalData['speciality'] : {},
                                            workhistory: finalData['workhistory'] ? finalData['workhistory'] : {},
                                            education: finalData['education'] ? finalData['education'] : {},
                                            employmenthistory: finalData['employmenthistory'] ? finalData['employmenthistory'] : {},
                                            questionary: finalData['questionary'] ? finalData['questionary'] : {},
                                            continuingeducation: finalData['continuingeducation'] ? finalData['continuingeducation'] : {},

                                        }
                                        if (role.toLowerCase() === 'user') {
                                            final['idApplication'] = reviewerData.idApplication;
                                            delete reviewerData['idApplication'];
                                            final['overview'] = reviewerData;
                                        } else {
                                            final['idApplication'] = reviewerData[0].idApplication;
                                            final['createDate'] = reviewerData[0].createdate;
                                            final['scheduleDate'] = reviewerData[0].scheduleDate;
                                        }
                                        let attachmentdata = {
                                            idApplication: final['idApplication'],
                                            userid: userId,
                                            searchType: 'user',
                                            role: role,
                                        }
                                        findAttachmentList(attachmentdata, function (err, attachmentList) {
                                            if (err) {
                                                errorResponse.queryError(err, function (data) {
                                                    res.status(400).send(data)
                                                })
                                            } else {
                                                final['attachment'] = attachmentList;
                                                if (role.toLowerCase() === 'admin') {
                                                    let searchData = {
                                                        role: role,
                                                        idApplication: reviewerData[0].idApplication,
                                                    };
                                                    findallactivity(searchData, function (err, activitydata) {
                                                        if (err) {
                                                            errorResponse.queryError(err, function (data) {
                                                                res.status(400).send(data)
                                                            })
                                                        } else {
                                                            final['activity'] = activitydata;
                                                            res.status(200).send(final)
                                                        }
                                                    })
                                                } else {
                                                    res.status(200).send(final)
                                                }

                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    } else {
        res.status(401).send('Unauthorized')
    }
}

exports.changeStatus = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let formType = req.body.formType;

    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let data = {
                userId: userId,
                formType: formType
            }
            findApplicationQuery(data, function (err, applicationData) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    if (applicationData.length > 0) {
                        let updateData = {
                            appid: applicationData[0].idApplication,
                            status: 'Submitted',
                        }
                        if (applicationData[0].status != 'Submitted') {
                            if (applicationData[0].status != 'Verified') {
                                changeStatus(updateData, function (err, updatedata) {
                                    if (err) {
                                        errorResponse.queryError(err, function (data) {
                                            res.status(400).send(data)
                                        })
                                    } else {
                                        let logbody = {
                                            userid: userId,
                                            idApplication: applicationData[0].idApplication,
                                            status: 'Submitted',
                                            comment: ' ',
                                            description: ' ',
                                            createdBy: userId,
                                        }
                                        insertapplicationreview(logbody, function (err, finalData) {
                                            if (err) {
                                                errorResponse.queryError(err, function (data) {
                                                    res.status(400).send(data)
                                                })
                                            } else {
                                                finduserbyuserid(userId, function (err, user) {
                                                    if (err) {
                                                        console.log('err in finding user', err);
                                                    }
                                                    if (user !== null) {
                                                        let html = '<h1>Guam Board of Medical Examiners(GBME) Licensing Portal </h1><br><p>New application with Application id no:' + applicationData[0].idApplication + '  have been submmitted.</p>'
                                                        let name = (user[0].firstName !== null && user[0].firstName !== undefined && user[0].firstName !== '') ? user[0].firstName : '';
                                                        email.sendEmail(name, adminEmail, 'New Application Submitted', html, function (err, success) {
                                                            if (err) {
                                                                console.log('email failed');
                                                            }
                                                            res.status(200).send({
                                                                status: updatedata,
                                                                submitDate: today
                                                            })
                                                        })
                                                    } else {
                                                        res.status(200).send({status: updatedata, submitDate: today})
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            } else {
                                res.status(200).send({status: "This Application Already Verified"});
                            }
                        } else {
                            res.status(200).send({status: "This Application Already Submitted"});
                        }
                    } else {
                        res.status(200).send({status: "fail", message: "User didnt start this form yet"})
                    }
                }
            })
        }
    })
}

exports.getsubmitedapplication = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let data = {
                status: 'Submitted'
            }
            findAllApplicationbyuserid(data, function (err, applicantData) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    res.status(200).send({applicantdata: applicantData})
                }
            })
        }
    })
}

exports.getquestions = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            validate.getQustion(req.query, function (err, validatedata) {
                if (err) {
                    errorResponse.missingParams(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    findQuestions(validatedata.formType, function (err, questions) {
                        if (err) {
                            errorResponse.queryError(err, function (data) {
                                res.status(400).send(data)
                            })
                        } else {
                            res.status(200).send({totalQuestion: questions.length, questions: questions})
                        }
                    })
                }

            })

        }
    })
}

exports.reviewApplication = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let validatedata = req.body;
            findApplicationQuery(validatedata.applicationid, function (err, applicationData) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    if (applicationData.length > 0) {
                        if (applicationData[0].status === 'Submitted') {
                            validatedata['ApplicationForm_type'] = applicationData[0].ApplicationForm_type;
                            validatedata['createdBy'] = userId;
                            validatedata['userid'] = applicationData[0].userid;
                            insertReviwerRequirementQuery(validatedata, function (err, reviewerdata) {
                                if (err) {
                                    errorResponse.queryError(err, function (data) {
                                        res.status(400).send(data)
                                    })
                                } else {
                                    finduserbyuserid(applicationData[0].userid, function (err, user) {
                                        if (err) {
                                            console.log('err in finding user', err);
                                        }
                                        if (user !== null) {
                                            let html = '';
                                            if (reviewerdata.status === 'pending') {
                                                html = '<h1>Guam Board of Medical Examiners(GBME) Licensing Portal </h1><br><p>We have  gone through your application and there are some changes to be done. Please login and check the comments and do the needful changes in the application.</p>'
                                            } else {
                                                html = '<h1>Guam Board of Medical Examiners(GBME) Licensing Portal </h1><br><p>Your Application, id no: ' + reviewerdata.Application_id + ' is verified now</p>'
                                            }
                                            email.sendEmail(adminEmail, user[0].username, 'Submitted Application', html, function (err, success) {
                                                if (err) {
                                                    console.log('email failed');
                                                }
                                                res.status(200).send(reviewerdata);
                                            })
                                        } else {
                                            res.status(200).send(reviewerdata);
                                        }
                                    })
                                }
                            })
                        } else {
                            res.status(400).send({status: "fail", message: "application not submitted yet"})
                        }
                    } else {
                        res.status(400).send({status: "fail", message: "application not found"})
                    }
                }
            })
        }
    })
}

exports.getallcategory = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
    }
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            allCategory(function (err, categoryData) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    res.status(200).send(categoryData);
                }
            })
        }
    })
}

exports.getuserallform = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let findApp = {
                userId: userId,
                formType: req.query.formType
            }
            findApplicationQuery(findApp, function (err, applicationData) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    if (applicationData.length > 0) {
                        applicationData[0]['role'] = role;
                        findApplicantQuerybySeqandUserId(applicationData[0], function (err, applicantData) {
                            if (err) {
                                errorResponse.queryError(err, function (data) {
                                    res.status(500).send(data)
                                })
                            } else {
                                let final = {}
                                final['seq'] = applicationData[0].Applicant_seq;
                                final['userId'] = userId;
                                findSubTableData(final, function (err, finalData) {
                                    if (err) {
                                        errorResponse.queryError(error, function (data) {
                                            res.status(500).send(data)
                                        })
                                    } else {
                                        let final = {
                                            data: {
                                                idApplication: applicationData[0].idApplication,
                                                applicant: applicantData[0],
                                                areaofpractice: finalData['areaofpractice'] ? finalData['areaofpractice'] : {},
                                                speciality: finalData['speciality'] ? finalData['speciality'] : {},
                                                workhistory: finalData['workhistory'] ? finalData['workhistory'] : {},
                                                education: finalData['education'] ? finalData['education'] : {},
                                                employmenthistory: finalData['employmenthistory'] ? finalData['employmenthistory'] : {},
                                                questionary: finalData['questionary'] ? finalData['questionary'] : {},
                                                continuingeducation: finalData['continuingeducation'] ? finalData['continuingeducation'] : {},
                                            }
                                        }
                                        res.status(200).send(final);
                                    }
                                })
                            }
                        })
                    } else {
                        findlastSeqNofromUser(userId, function (err, seqNo) {
                            if (err) {
                                errorResponse.queryError(err, function (data) {
                                    res.status(400).send(data)
                                })
                            } else {
                                if (seqNo.length > 0) {
                                    let seq = seqNo[0].Applicant_seq;
                                    let Find = {
                                        userid: userId,
                                        Applicant_seq: seq,
                                        role: role
                                    };
                                    findApplicantQuerybySeqandUserId(Find, function (err, applicantData) {
                                        if (err) {
                                            errorResponse.queryError(err, function (data) {
                                                res.status(500).send(data)
                                            })
                                        } else {
                                            let final1 = {}
                                            final1['seq'] = seq;
                                            final1['userId'] = userId;
                                            findSubTableData(final1, function (err, finalData) {
                                                if (err) {
                                                    errorResponse.queryError(error, function (data) {
                                                        res.status(500).send(data)
                                                    })
                                                } else {
                                                    finalData['applicant'] = applicantData;
                                                    let final = {};
                                                    final['userId'] = userId;
                                                    final['data'] = filterdata(finalData);
                                                    insertApplicantQuery(final, function (err, newData) {
                                                        if (err) {
                                                            errorResponse.queryError(err, function (data) {
                                                                res.status(500).send(data)
                                                            })
                                                        } else {
                                                            //res.status(200).send(newData);
                                                            let send = {
                                                                userid: userId,
                                                                Applicant_seq: newData.insertId,
                                                                role: role
                                                            }
                                                            findApplicantQuerybySeqandUserId(send, function (err, applicantData) {
                                                                if (err) {
                                                                    errorResponse.queryError(error, function (data) {
                                                                        res.status(500).send(data)
                                                                    })
                                                                } else {
                                                                    let senderData = {
                                                                        userid: userId,
                                                                        formType: req.query.formType,
                                                                        seq: newData.insertId
                                                                    };
                                                                    insertApplicationQuery(senderData, function (err, insertApplicationData) {
                                                                        if (err) {
                                                                            errorResponse.queryError(err, function (data) {
                                                                                res.status(500).send(data)
                                                                            })
                                                                        } else {
                                                                            if (insertApplicationData.insertId != 0) {
                                                                                let myJson = {
                                                                                    seq: newData.insertId,
                                                                                    userId: userId
                                                                                }
                                                                                findSubTableData(myJson, function (err, finalData) {
                                                                                    if (err) {
                                                                                        errorResponse.queryError(err, function (data) {
                                                                                            res.status(500).send(data)
                                                                                        })
                                                                                    } else {
                                                                                        let final = {
                                                                                            data: {
                                                                                                idApplication: insertApplicationData.insertId,
                                                                                                applicant: applicantData[0],
                                                                                                areaofpractice: finalData['areaofpractice'] ? finalData['areaofpractice'] : {},
                                                                                                speciality: finalData['speciality'] ? finalData['speciality'] : {},
                                                                                                workhistory: finalData['workhistory'] ? finalData['workhistory'] : {},
                                                                                                education: finalData['education'] ? finalData['education'] : {},
                                                                                                employmenthistory: finalData['employmenthistory'] ? finalData['employmenthistory'] : {},
                                                                                                questionary: finalData['questionary'] ? finalData['questionary'] : {},
                                                                                                continuingeducation: finalData['continuingeducation'] ? finalData['continuingeducation'] : {},
                                                                                            }
                                                                                        }
                                                                                        res.status(200).send(final);
                                                                                    }
                                                                                })
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    res.status(400).send({Error: "User didnt submit any application yet"})
                                }
                            }
                        })
                    }
                }
            })
        }
    })
}

exports.getattachmentlist = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    let formType = req.query.formType;
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let data = {
                formType: formType,
                searchType: 'page'
            }
            findAttachmentList(data, function (err, attachmentList) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    res.status(200).send(attachmentList)
                }
            })
        }
    })
}

exports.uploadattachment = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let role = decodedJwt.payload['custom:role'];
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            validate.uploadAttachment(req.body, function (err, validateData) {
                if (err) {
                    errorResponse.missingParams(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    if (role.toLowerCase() === 'user') {
                        validateData['userid'] = userId;
                        validateData['createdby'] = userId;
                    } else {
                        validateData['createdby'] = userId;
                    }
                    insertAttachement(validateData, function (err, uploadedData) {
                        if (err) {
                            errorResponse.queryError(err, function (data) {
                                res.status(400).send(data)
                            })
                        } else {
                            if (uploadedData[1].insertId != 0) {
                                res.status(200).send({status: "Document Upload Successfully"});
                            } else {
                                res.status(500).send({status: "Error During Upload Document"});
                            }
                        }
                    })
                }
            })
        }
    })
}

exports.getuploadedattachment = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    let idApplication = req.query.idApplication;
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let data = {
                idApplication: idApplication,
                userid: userId,
                searchType: 'user',
                role: role,
            }
            findAttachmentList(data, function (err, attachmentList) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    res.status(200).send(attachmentList)
                }
            })
        }
    })
}

exports.getverifiedforms = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    let idApplication = req.query.idApplication;
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            findVerifiedApp(function (err, veryfiedData) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    res.status(200).send(veryfiedData)
                }
            })
        }
    })
}

exports.scheduleform = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            findApplicationQuery(req.body.idApplication, function (err, applicationData) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    let updateData = {
                        idApplication: req.body.idApplication,
                        comment: (req.body.comment) ? req.body.comment : "",
                        status: req.body.status,
                        scheduledate: req.body.scheduledate,
                    }
                    changestatusofApplication(updateData, function (err, updatedApplication) {
                        if (err) {
                            errorResponse.queryError(err, function (data) {
                                res.status(400).send(data)
                            })
                        } else {
                            let logbody = {
                                userid: applicationData[0].userid,
                                idApplication: applicationData[0].idApplication,
                                status: req.body.status,
                                comment: (req.body.comment) ? req.body.comment : "",
                                description: ' ',
                                createdBy: userId,
                            }
                            insertapplicationreview(logbody, function (err, finalData) {
                                if (err) {
                                    errorResponse.queryError(err, function (data) {
                                        res.status(400).send(data)
                                    })
                                } else {
                                    res.status(200).send({status: "Status Change Successfully"})
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

exports.getallactivity = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let searchdata = {
                role: role,
                userId: userId
            }
            findallactivity(searchdata, function (err, activitydata) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    res.status(400).send(activitydata)
                }
            })
        }
    })
}

exports.getactivitybyidapplication = (req, res) => {
    let token = req.headers['authorization'];
    var decodedJwt = jwt.decode(token, {complete: true});
    let data = {
        email: decodedJwt.payload.email,
        sub: decodedJwt.payload.sub,
        username: decodedJwt.payload.email,
        password: (decodedJwt.payload.password) ? decodedJwt.payload.password : '',
        role: decodedJwt.payload['custom:role'],
        gender: decodedJwt.payload.gender,
        phoneNumber: decodedJwt.payload.phoneNumber,
        middleName: decodedJwt.payload.middleName,
        firstName: decodedJwt.payload.firstName,
        address: decodedJwt.payload.address
    }
    let role = decodedJwt.payload['custom:role'];
    findUserbyGlobalId(data, function (err, userId) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            let searchdata = {
                role: role,
                userId: userId,
                idApplication: req.query.idApplication
            }
            findallactivity(searchdata, function (err, activitydata) {
                if (err) {
                    errorResponse.queryError(err, function (data) {
                        res.status(400).send(data)
                    })
                } else {
                    res.status(200).send(activitydata)
                }
            })
        }
    })
}

exports.testemail = (req, res) => {
    let html = '<h1>Guam Board of Medical Examiners(GBME) Licensing Portal </h1><br><p>Your Application, id no: ' + 1 + ' is verified now</p>'

    email.sendEmail('syb.freelancer@gmail.com', adminEmail, 'Submitted Application', html, function (err, success) {
        if (err) {
            console.log('email failed');
        }
        res.status(200).send();
    })

}


// =================================================================================================================

exports.getBlockDate = (req, res) => {
    findAllBlockDates(function (err, userData) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            res.status(200).send({applicantdata: userData})
        }
    })
};
exports.getlistofproduct = (req, res) => {
    findAllProduct(function (err, userData) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            res.status(200).send({applicantdata: userData})
        }
    })
};

exports.getBookingData = (req, res) => {
    findAllBookingData(function (err, userData) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            res.status(200).send({applicantdata: userData})
        }
    })
};

exports.getWorkingHours = (req, res) => {
    findWorkingHours(function (err, userData) {
        if (err) {
            errorResponse.queryError(err, function (data) {
                res.status(400).send(data)
            })
        } else {
            res.status(200).send({applicantdata: userData})
        }
    })
};

exports.getBookingDetails = (req, res) => {
    if (req.query.search_date && req.query.name) {
        searchData(req, function (err, userData) {
            if (err) {
                errorResponse.queryError(err, function (data) {
                    res.status(400).send(data)
                })
            } else {
                res.status(200).send(userData)
            }
        })
    } else {
        res.status(400).send({error: true, message: 'Body parameter search_date or name missing'})
    }
};

exports.getSubProductDetails = (req, res) => {
    if (req.query.unique_id && req.query.order_id) {
        searchSubProduct(req, function (err, userData) {
            if (err) {
                errorResponse.queryError(err, function (data) {
                    res.status(400).send(data)
                })
            } else {
                res.status(200).send(userData)
            }
        })
    } else {
        res.status(400).send({error: true, message: 'Body parameter unique_id or order_id missing'})
    }
};

exports.generateBooking = (req, res) => {
    if (req.body.eventData && req.body.userData) {
        bookingInsert(req.body, function (err, bookingData) {
            if (err) {
                errorResponse.queryError(err, function (data) {
                    res.status(400).send(data)
                })
            } else {
                res.status(200).send({error: false, message: "success", data: bookingData})
            }
        })
    } else {
        res.status(400).send({error: true, message: "body parameter are missing"})
    }
};

exports.updateBooking = (req, res) => {
    if (req.body.eventData && req.body.userData) {
        updateBookingData(req.body, function (err, bookingData) {
            if (err) {
                errorResponse.queryError(err, function (data) {
                    res.status(400).send(data)
                })
            } else {
                res.status(200).send({error: false, message: "success", data: bookingData})
            }
        })
    } else {
        res.status(400).send({error: true, message: "body parameter are missing"})
    }
};

exports.addUserSubProduct = (req, res) => {
    if (req.body.unique_id && req.body.order_id && req.body.subData) {
        addSubData(req.body, function (err, bookingData) {
            if (err) {
                errorResponse.queryError(err, function (data) {
                    res.status(400).send(data)
                })
            } else {
                res.status(200).send({error: false, message: "success", data: bookingData})
            }
        })
    } else {
        res.status(400).send({error: true, message: "body parameter are missing"})
    }
};


// ====================================================================================================
const searchData = function (req, cb) {
    const query = `SELECT b.order_id,b.user_id, b.booking_type, b.date_selected, b.time_slots, b.quantity, b.product_id, b.product_type, b.product_name,b.product_name_pt, b.product_usages, b.product_duration,b.date_added,u.title, u.firstname, u.lastname, u.birthdate,u.country,u.dialing_code,u.phonenumber,u.email  FROM xyz_order_user_booking_details b JOIN xyz_order_user_details u where u.order_id = b.order_id and u.firstname = '` + req.query.name + `' and b.date_selected = '` + req.query.search_date + `';`;
    try {
        mysql(query, [], function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                cb(null, userData)
            }
        });
    } catch (e) {
        cb(e, null);
    }
};

const bookingInsert = function (data, cb) {
    const query = `INSERT INTO xyz_order_user_booking_details SET ?`;
    const order_id = Math.floor(Math.random() * (9999999 - 999999)) + 999999;
    let where = [];
    let val = {
        date_selected: data.eventData.date_selected,
        booking_type: data.eventData.booking_type,
        product_duration: data.eventData.product_duration,
        product_type: data.eventData.product_type,
        product_name: data.eventData.product_name,
        quantity: data.eventData.quantity,
        time_slots: data.eventData.time_slots,
        order_id: order_id,
    }
    if (data.eventData.overflow) {
        val['overflow'] = data.eventData.overflow;
    }
    where.push(val);
    mysql(query, where, function (err1, result) {
        const query1 = `INSERT INTO xyz_order_user_details SET ?`;
        let where1 = [];
        let val1 = {
            order_id: order_id,
            firstname: data.userData.firstname,
            lastname: data.userData.lastname,
            phonenumber: data.userData.phonenumber,
            email: data.userData.email,
        }
        where1.push(val1);
        if (err1)
            cb(err1, null);
        else {
            mysql(query1, where1, function (err, result2) {
                if (err)
                    cb(err, null);
                else
                    cb(null, {booking_details: result, user_details: result2});
            })
        }
    });
};

const addSubData = function (data, cb) {
    const query = `UPDATE xyz_order_user_booking_details SET has_sub_products = 'yes' where order_id = '` + data.order_id + `' and unique_id = ` + data.unique_id + `; `;
    console.log('query',query);
    mysql(query, [], function (err1, result) {
        console.log('err1, result', err1, result);
        if (err1)
            cb(err1, null);
        else {
            const query1 = `INSERT INTO xyz_order_sub_products_details SET ?`;
            let where = [];
            let val = {
                order_id: data.order_id,
                quantity: data.subData.quantity,
                sub_product_id: data.subData.sub_product_id,
                sub_product_name: data.subData.sub_product_name,
                sub_product_name_pt: data.subData.sub_product_name_pt,
                sub_product_type: data.subData.sub_product_type,
                sub_product_price: data.subData.sub_product_price,
            };
            where.push(val);
            mysql(query1, where, function (err1, result) {
                if (err1)
                    cb(err1, null);
                else {
                    cb(null, result);
                }
            })
        }
    });
};

const updateBookingData = function (data, cb) {
    const query = `UPDATE xyz_order_user_booking_details SET quantity = '` + data.eventData.quantity + `', date_selected = '` + data.eventData.date_selected + `', product_duration = ` + data.eventData.product_duration + `, product_type = '` + data.eventData.product_type + `', product_name = '` + data.eventData.product_name + `', time_slots = '` + data.eventData.time_slots + `' where order_id = '` + data.eventData.order_id + `' and unique_id = ` + data.eventData.unique_id + `;`;
    console.log('query', query);

    mysql(query, [], function (err1, result) {
        console.log('err1, result', err1, result);
        if (err1)
            cb(err1, null);
        else {
            const query1 = `UPDATE xyz_order_user_details SET firstname = ?, lastname = ?, phonenumber = ?,email = ? where order_id = ?`;
            mysql(query1, [data.userData.firstname, data.userData.lastname, data.userData.phonenumber, data.userData.email, data.eventData.order_id], function (err, result2) {
                if (err)
                    cb(err, null);
                else
                    cb(null, {booking_details: result, user_details: result2});
            })
        }
    });
};

const findAllBlockDates = function (cb) {
    const query = `Select * from xyz_blocks_blocker_cutsom`;
    try {
        mysql(query, [], function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                cb(null, userData)
            }
        });
    } catch (e) {
        cb(e, null);
    }
};

const findAllProduct = function (cb) {
    const query = `Select * from xyz_sub_products`;
    try {
        mysql(query, [], function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                cb(null, userData)
            }
        });
    } catch (e) {
        cb(e, null);
    }
};

const findAllBookingData = function (cb) {
    const query = `SELECT b.has_sub_products, b.overflow, b.unique_id, b.order_id,b.user_id, b.booking_type, b.date_selected, b.time_slots, b.quantity, b.product_id, b.product_type, b.product_name,b.product_name_pt, b.product_usages, b.product_duration,b.date_added,u.title, u.firstname, u.lastname, u.birthdate,u.country,u.dialing_code,u.phonenumber,u.email 
    FROM xyz_order_user_booking_details b JOIN xyz_order_user_details u where u.order_id = b.order_id;`;
    try {
        mysql(query, [], function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                cb(null, userData)
            }
        });
    } catch (e) {
        cb(e, null);
    }
};

const searchSubProduct = function (req,cb) {
    const query = `SELECT * FROM xyz_order_sub_products_details os where os.order_id = ?`;
    try {
        mysql(query, [req.query.order_id], function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                cb(null, userData)
            }
        });
    } catch (e) {
        cb(e, null);
    }
};

const findWorkingHours = function (cb) {
    const query = `Select * from xyz_working_hours`;
    try {
        mysql(query, [], function (err, userData) {
            if (err) {
                cb(err, null)
            } else {
                cb(null, userData)
            }
        });
    } catch (e) {
        cb(e, null);
    }
};

// ====================================================================================================
