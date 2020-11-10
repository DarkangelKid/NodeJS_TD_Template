const httpStatus = require('http-status');
const { omit } = require('lodash');
const moment = require('moment');
const { QueryTypes } = require('sequelize');

const db = require('../../config/mssql');

const Datasync = db.datasync;
const ANMsync = db.anmsync;
const CAMERAsync = db.camerasync;

const { Op } = db.Sequelize;

const sequelize = db.sequelize;

exports.createCamera = async (req, res, next) => {
  try {
    /* const item = await Datasync.create({
      appType: 'Camera',
      data: JSON.stringify(req.body),
    }); */

    let data = req.body;

    let itemANM = Object.assign(
      {},
      {
        appType: 'Camera',
        data: JSON.stringify(req.body),
        title: data.notification.body,
        time_txt: data.data.time,
        time: moment.utc(data.data.time).format('YYYY-MM-DD HH:mm:ss'),
        violate_type: data.data.violate_type,
        camera_location: data.data.camera.location,
        camera_location_latitude: data.data.camera.lonlat.latitude,
        camera_location_longitude: data.data.camera.lonlat.longitude,
      },
    );
    //2020-10-30 08:06:18.5950000 +00:00
    try {
      await CAMERAsync.create(itemANM);
    } catch (err) {
      console.log('LOI');
      // console.log(err);
    }

    res.status(httpStatus.CREATED);
    return res.json({ status: true });
  } catch (error) {
    next(error);
  }
};

exports.createCybersecurity = async (req, res, next) => {
  try {
    /* const item = await Datasync.create({
      appType: 'Cybersecurity',
      data: JSON.stringify(req.body),
    }); */

    let data = req.body;

    await Promise.all(
      data.ctx.payload.filtered.map(async (i) => {
        let { _source } = i;
        let itemANM = Object.assign(
          {},
          {
            appType: 'Cybersecurity',
            data: JSON.stringify(req.body),
            fidelity: _source.fidelity,
            srcip: _source.srcip,
            srcip_geo_countryCode: _source.srcip_geo.countryCode,
            srcip_geo_countryName: _source.srcip_geo.countryName,
            srcip_geo_city: _source.srcip_geo.city,
            srcip_geo_latitude: _source.srcip_geo.latitude,
            srcip_geo_longitude: _source.srcip_geo.longitude,
            dstip: _source.dstip,
            dstip_geo_countryCode: _source.srcip_geo.countryCode,
            dstip_geo_countryName: _source.srcip_geo.countryName,
            dstip_geo_city: _source.srcip_geo.city,
            dstip_geo_latitude: _source.srcip_geo.latitude,
            dstip_geo_longitude: _source.srcip_geo.longitude,
            event_name: _source.event_name,
            event_category: _source.event_category,
            event_score: _source.event_score,
            alert_time: _source.alert_time,
            timestamp: _source.timestamp,
            timestamp_utc: _source.timestamp_utc,
            time: moment.utc(_source.timestamp_utc).format('YYYY-MM-DD HH:mm:ss'),
          },
        );
        //2020-10-30 08:06:18.5950000 +00:00
        try {
          await ANMsync.create(itemANM);
        } catch (err) {
          console.log('LOI');
          // console.log(err);
        }
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json({ status: true });
  } catch (error) {
    next(error);
  }
};

exports.HandleCybersecurity = async (req, res, next) => {
  try {
    const items = await Datasync.findAll({ where: { appType: 'Cybersecurity' } });

    // Promise.all()
    /* await Promise.all(
      items.map(async (item) => {
        let data = JSON.parse(item.data);
        //console.log(data.ctx.payload.filtered);
        await Promise.all(
          data.ctx.payload.filtered.map(async (i) => {
            let { _source } = i;
            let itemANM = Object.assign(
              {},
              {
                appType: 'Cybersecurity',
                data: item.data,
                fidelity: _source.fidelity,
                srcip: _source.srcip,
                srcip_geo_countryCode: _source.srcip_geo.countryCode,
                srcip_geo_countryName: _source.srcip_geo.countryName,
                srcip_geo_city: _source.srcip_geo.city,
                srcip_geo_latitude: _source.srcip_geo.latitude,
                srcip_geo_longitude: _source.srcip_geo.longitude,
                dstip: _source.dstip,
                dstip_geo_countryCode: _source.srcip_geo.countryCode,
                dstip_geo_countryName: _source.srcip_geo.countryName,
                dstip_geo_city: _source.srcip_geo.city,
                dstip_geo_latitude: _source.srcip_geo.latitude,
                dstip_geo_longitude: _source.srcip_geo.longitude,
                event_name: _source.event_name,
                event_category: _source.event_category,
                event_score: _source.event_score,
                alert_time: _source.alert_time,
                timestamp: _source.timestamp,
                timestamp_utc: _source.timestamp_utc,
                time: moment.utc(_source.timestamp_utc).format('YYYY-MM-DD HH:mm:ss'),
              },
            );
            //2020-10-30 08:06:18.5950000 +00:00
            try {
              await ANMsync.create(itemANM);
            } catch (err) {
              console.log('LOI');
              // console.log(err);
            }
          }),
        );
        item.check = 4;
        await item.save();
      }),
    ); */

    //  res.status(httpStatus.CREATED);
    return res.json(items.length);
  } catch (error) {
    next(error);
  }
};

exports.HandleCamera = async (req, res, next) => {
  try {
    const items = await Datasync.findAll({ where: { appType: 'Camera' } });

    // Promise.all()
    await Promise.all(
      items.map(async (item) => {
        let data = JSON.parse(item.data);

        let itemANM = Object.assign(
          {},
          {
            appType: 'Camera',
            data: item.data,
            title: data.notification.body,
            time_txt: data.data.time,
            time: moment.utc(data.data.time).format('YYYY-MM-DD HH:mm:ss'),
            violate_type: data.data.violate_type,
            camera_location: data.data.camera.location,
            camera_location_latitude: data.data.camera.lonlat.latitude,
            camera_location_longitude: data.data.camera.lonlat.longitude,
          },
        );
        //2020-10-30 08:06:18.5950000 +00:00
        try {
          await CAMERAsync.create(itemANM);
        } catch (err) {
          console.log('LOI');
          // console.log(err);
        }

        item.check = 4;
        await item.save();
      }),
    );

    //  res.status(httpStatus.CREATED);
    return res.json(items.length);
  } catch (error) {
    next(error);
  }
};

exports.CybersecurityIPBiTanCong = async (req, res, next) => {
  try {
    let { fromdate, todate } = req.query;
    let query =
      ' SELECT Top 10 [dstip] as diachi, COUNT(dstip) as luot FROM [DBCHATNEW].[dbo].[ANMsync] GROUP BY [dstip] ORDER BY  COUNT(dstip) DESC';

    if (fromdate && todate) {
      query = `SELECT Top 10 [dstip] as diachi, COUNT(dstip) as luot FROM [DBCHATNEW].[dbo].[ANMsync] WHERE ([time] >= '${fromdate}' AND [time] <= '${todate}') GROUP BY [dstip] ORDER BY  COUNT(dstip) DESC`;
    }

    const items = await sequelize.query(query, { type: QueryTypes.SELECT });

    return res.json(items);
  } catch (error) {
    next(error);
  }
};
exports.CybersecurityIPTanCong = async (req, res, next) => {
  try {
    const { fromdate, todate } = req.query;
    let query =
      'SELECT Top 10 [srcip] as diachi, COUNT(srcip) as luot FROM [DBCHATNEW].[dbo].[ANMsync] GROUP BY [srcip] ORDER BY  COUNT(srcip) DESC';

    if (fromdate && todate) {
      query = `SELECT Top 10 [srcip] as diachi, COUNT(srcip) as luot FROM [DBCHATNEW].[dbo].[ANMsync] WHERE ([time] >= '${fromdate}' AND [time] <= '${todate}') GROUP BY [srcip] ORDER BY  COUNT(srcip) DESC`;
    }

    const items = await sequelize.query(query, { type: QueryTypes.SELECT });

    return res.json(items);
  } catch (error) {
    next(error);
  }
};

exports.CybersecurityQuocGiaTanCong = async (req, res, next) => {
  try {
    const { fromdate, todate } = req.query;
    let query =
      'SELECT Top 10 [srcip_geo_countryName] as diachi, COUNT(srcip_geo_countryName) as luot FROM [DBCHATNEW].[dbo].[ANMsync] GROUP BY [srcip_geo_countryName] ORDER BY  COUNT(srcip_geo_countryName) DESC';

    if (fromdate && todate) {
      query = `SELECT Top 10 [srcip_geo_countryName] as diachi, COUNT(srcip_geo_countryName) as luot FROM [DBCHATNEW].[dbo].[ANMsync] WHERE ([time] >= '${fromdate}' AND [time] <= '${todate}') GROUP BY [srcip_geo_countryName] ORDER BY  COUNT(srcip_geo_countryName) DESC`;
    }

    const items = await sequelize.query(query, { type: QueryTypes.SELECT });

    return res.json(items);
  } catch (error) {
    next(error);
  }
};

exports.CybersecurityTongHopCuocTanCong = async (req, res, next) => {
  try {
    const { fromdate, todate } = req.query;
    let query =
      'SELECT Top 10 [event_name] as diachi, COUNT(event_name) as luot FROM [DBCHATNEW].[dbo].[ANMsync] GROUP BY [event_name] ORDER BY  COUNT(event_name) DESC';

    if (fromdate && todate) {
      query = `SELECT Top 10 [event_name] as diachi, COUNT(event_name) as luot FROM [DBCHATNEW].[dbo].[ANMsync] WHERE ([time] >= '${fromdate}' AND [time] <= '${todate}') GROUP BY [event_name] ORDER BY  COUNT(event_name) DESC`;
    }

    const items = await sequelize.query(query, { type: QueryTypes.SELECT });

    return res.json(items);
  } catch (error) {
    next(error);
  }
};
