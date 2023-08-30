import axios from 'axios'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

const storeState = {
  ideas: [],
  idea: {},
  newIdea: null,
  ideaId: null,
  ideaComments: [],
  ideaTags: [],
  votesInLocalStorage: [],
  commentVotesInLocalStorage: [],
  baseUrlProcedures: '/proteomicsdb/logic/community/procedures'
}
const mutations = {
  setIdeas (state, ideas) {
    state.ideas = ideas
  },
  setIdea (state, idea) {
    state.idea = idea
  },
  setAddIdea (state, ideasConfig) {
    state.newIdea = ideasConfig
    state.newIdea.ideasId = state.ideaId
  },
  setIdeaId (state, ideaId) {
    state.ideaId = ideaId
  },
  setIdeaTags (state, ideaTags) {
    state.ideaTags = ideaTags
  },
  setVotesInLocalStorage (state, votesInLocalStorage) {
    state.votesInLocalStorage.push(votesInLocalStorage)
  },
  removeVotesInLocalStorage (state, votesId) {
    const idx = state.votesInLocalStorage.findIndex(x => x.id === votesId)
    state.votesInLocalStorage.splice(idx, 1)
  },
  setCommentVotesInLocalStorage (state, commentVotesInLocalStorage) {
    state.commentVotesInLocalStorage.push(commentVotesInLocalStorage)
  },
  removeCommentVotesInLocalStorage (state, commentVotesId) {
    const idx = state.commentVotesInLocalStorage.findIndex(x => x.id === commentVotesId)
    state.commentVotesInLocalStorage.splice(idx, 1)
  }
}
const getters = {}

const actions = {
  loadIdeas: ({ commit, state, rootState }) => {
    axios.get(`${rootState.host}${state.baseUrlProcedures}/getIdeas.xsjs`)
      .then((response) => {
        const result = response.data
        const orderedResult = _.orderBy(result, ['ideaCreatedDate'], ['desc'])
        commit('setIdeas', orderedResult)
        orderedResult.forEach(result => {
          const selectedVote = localStorage.getItem(result.ideasId)
          if (selectedVote) {
            commit('setVotesInLocalStorage', { id: result.ideasId, value: selectedVote })
          }
        })
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
  },
  loadIdea: ({ commit, state, rootState }, ideaId) => {
    const requestOne = axios.get(`${rootState.host}${state.baseUrlProcedures}/getIdea.xsjs?ideasId=${ideaId}`)
    const requestTwo = axios.get(`${rootState.host}${state.baseUrlProcedures}/mapTagsToIdeas.xsjs?ideasId=${ideaId}`)
    axios
      .all([requestOne, requestTwo])
      .then(axios.spread((...responses) => {
        const ideaComments = responses[0].data.ideaComments.length > 0
          ? _.orderBy(responses[0].data.ideaComments.map((ideaComment) => {
            return {
              ...ideaComment,
              commentReplies: ideaComment.commentReplies.length > 0
                ? _.orderBy(ideaComment.commentReplies.map((reply) => {
                  return {
                    ...reply
                  }
                }), ['commentCreatedDate'], ['desc'])
                : []
            }
          }), ['commentCreatedDate'], ['desc'])
          : []
        const resultOne = {
          ...responses[0].data,
          ideaComments
        }
        commit('setIdea', resultOne)

        const resultTwo = responses[1].data
        commit('setIdeaTags', resultTwo)
        const selectedVote = localStorage.getItem(resultOne.ideasId)
        if (selectedVote) {
          commit('setVotesInLocalStorage', { id: resultOne.ideasId, value: selectedVote })
        }
        resultOne.ideaComments.forEach(result => {
          const selectedComment = localStorage.getItem(result.commentId)
          if (selectedComment) {
            commit('setCommentVotesInLocalStorage', { id: resultOne.ideasId + 'c' + result.commentId, value: selectedComment })
          }
        })
      }))
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
  },
  submitIdea: ({ commit, state, rootState }, ideaConfig) => {
    const cleanTags = ideaConfig.tags.map(v => v.toLowerCase().replace(/\s/g, ''))
    const tags = '&tags[]=' + cleanTags.join('&tags[]=')
    axios.get(`${rootState.host}${state.baseUrlProcedures}/createIdea.xsjs?mode=createIdea&ideaTitle="${ideaConfig.ideaTitle}"&ideaDescription="${ideaConfig.ideaDescription}"&ideaPurpose="${ideaConfig.ideaPurpose}"&ideaFeatures="${ideaConfig.ideaFeatures}"&ideaImplementation="${ideaConfig.ideaImplementation}"&twitterName="${ideaConfig.twitterName}"&username="${ideaConfig.username}"&analyticsLink="${ideaConfig.analyticsLink}"${tags}`)
      .then((response) => {
        commit('setIdeaId', response.data.ideasId)
        commit('setAddIdea', response.data)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
  },
  voteIdea: ({ commit, state, rootState }, voteConfig) => {
    const selectedIdea = localStorage.getItem(voteConfig.ideasId)
    if (selectedIdea) {
      localStorage.removeItem(voteConfig.ideasId)
      commit('removeVotesInLocalStorage', voteConfig.ideasId)
    } else {
      if (voteConfig.vote < 0) {
        const uuid = '0' + uuidv4()
        localStorage.setItem(voteConfig.ideasId, uuid)
        commit('setVotesInLocalStorage', { id: voteConfig.ideasId, value: uuid })
      } else {
        const uuid = '1' + uuidv4()
        localStorage.setItem(voteConfig.ideasId, uuid)
        commit('setVotesInLocalStorage', { id: voteConfig.ideasId, value: uuid })
      }
    }
    axios.get(`${rootState.host}${state.baseUrlProcedures}/createVote.xsjs?mode=createIdeaVote&ideasId=${voteConfig.ideasId}&upvote=${voteConfig.vote}`)
      .then(() => {
        if (state.ideas.length > 0) {
          const idx = state.ideas.findIndex((idea) => {
            return idea.ideasId === voteConfig.ideasId
          })
          state.ideas[idx].nrIdeaVotes = state.ideas[idx].nrIdeaVotes + voteConfig.vote
          commit('setIdeas', state.ideas)
        }
        if (state.idea) {
          state.idea.nrIdeaVotes = state.idea.nrIdeaVotes + voteConfig.vote
          commit('setIdea', state.idea)
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
  },
  voteComment: ({ commit, state, rootState }, config) => {
    const selectedComment = localStorage.getItem(config.ideasId + 'c' + config.commentId)
    if (selectedComment) {
      localStorage.removeItem(config.ideasId + 'c' + config.commentId)
      commit('removeCommentVotesInLocalStorage', config.ideasId + 'c' + config.commentId)
    } else {
      if (config.vote < 0) {
        const uuid = '0' + uuidv4()
        localStorage.setItem(config.ideasId + 'c' + config.commentId, uuid)
        commit('setCommentVotesInLocalStorage', { id: config.ideasId + 'c' + config.commentId, value: uuid })
      } else {
        const uuid = '1' + uuidv4()
        localStorage.setItem(config.ideasId + 'c' + config.commentId, uuid)
        commit('setCommentVotesInLocalStorage', { id: config.ideasId + 'c' + config.commentId, value: uuid })
      }
    }
    axios.get(`${rootState.host}${state.baseUrlProcedures}/createVote.xsjs?mode=createCommentVote&commentId="${config.commentId}"&upvote="${config.vote}"`)
      .then((response) => {
        const idx = state.idea.ideaComments.findIndex((ideaComment) => {
          return ideaComment.commentId === config.commentId
        })
        state.idea.ideaComments[idx].nrCommentVotes = state.idea.ideaComments[idx].nrCommentVotes + Number(response.data)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
  },
  submitIdeaComment: ({ state, rootState }, ideaComment) => {
    axios.get(`${rootState.host}${state.baseUrlProcedures}/createComment.xsjs?mode=createIdeaComment&ideasId=${ideaComment.ideasId}&commentText="${ideaComment.comment}"&replyToId=0&username="${ideaComment.username}"`)
      .then((response) => {
        state.idea.ideaComments.unshift({
          ...response.data
        })
        state.idea.nrIdeaComments = state.idea.nrIdeaComments + 1
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
  },
  submitCommentReply: ({ state, rootState }, commentReply) => {
    axios.get(`${rootState.host}${state.baseUrlProcedures}/createComment.xsjs?mode=createCommentReply&ideasId=${commentReply.ideasId}&commentText="${commentReply.comment}"&replyToId=${commentReply.commentId}&username="${commentReply.username}"`)
      .then((response) => {
        const idx = state.idea.ideaComments.findIndex((ideaComment) => {
          return ideaComment.commentId === commentReply.commentId
        })
        state.idea.ideaComments[idx].commentReplies.unshift({
          ...response.data
        })
        state.idea.ideaComments[idx].nrCommentReplies = state.idea.ideaComments[idx].nrCommentReplies + 1
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
  }
}

export default {
  namespaced: true,
  state: storeState,
  mutations,
  getters,
  actions
}
