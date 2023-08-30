import axios from 'axios'

const utils = {

  async renewSession (host, uuid) {
    await axios.get(
      host +
            '/proteomicsdb/logic/secure/refreshUUID.xsjs',
      { params: { uuid: uuid } }
    )
    this.expiry_days = 14
  }
}

export default utils
