<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card elevation="0">
            <v-card-title class="text-h4">
              How to cite us
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-card-title>Key Publications</v-card-title>

                <template
                  v-for="ref in [...citations.key_pubs]"
                >
                  <v-divider
                    :key="`${ref.title}-divider`"
                  />
                  <v-list-item
                    :key="ref.title"
                    :href="ref.link"
                    target="_blank"
                  >
                    <v-list-item-content>
                      <div>{{ ref.author }}</div>

                      <v-list-item-title>
                        {{ ref.title }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ ref.publication }}
                      </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-icon small>
                        mdi mdi-open-in-new
                      </v-icon>
                    </v-list-item-action>
                  </v-list-item>
                </template>

                <v-list-item>
                  <v-spacer />
                </v-list-item>
                <v-card-title>More Publications</v-card-title>
                <v-list-item
                  v-for="ref in [...citations.more]"
                  :key="ref.title"
                  :href="ref.link"
                  target="_blank"
                >
                  <v-col>
                    <v-row>
                      <v-divider />
                    </v-row>
                    <v-row>
                      <v-list-item-content>
                        {{ ref.author }}
                        <v-list-item-title>
                          {{ ref.title }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ ref.publication }}
                        </v-list-item-subtitle>
                      </v-list-item-content>

                      <v-list-item-action>
                        <v-icon small>
                          mdi mdi-open-in-new
                        </v-icon>
                      </v-list-item-action>
                    </v-row>
                  </v-col>
                </v-list-item>
                <v-list-item>
                  <v-spacer />
                  <!--                </v-list-item>-->
                  <!--                <v-card-title>Further Reading</v-card-title>-->
                  <!--                <v-list-item-->
                  <!--                  v-for="ref in citations.further"-->
                  <!--                  :key="ref.title"-->
                  <!--                  @click="openLink(ref.link)"-->
                  <!--                >-->
                  <!--                  <v-col>-->
                  <!--                    <v-row>-->
                  <!--                      <v-divider />-->
                  <!--                    </v-row>-->
                  <!--                    <v-row>-->
                  <!--                      <v-list-item-content>-->
                  <!--                        {{ ref.author }}-->
                  <!--                        <v-list-item-title>-->
                  <!--                          {{ ref.title }}-->
                  <!--                        </v-list-item-title>-->
                  <!--                        <v-list-item-subtitle>-->
                  <!--                          {{ ref.publication }}-->
                  <!--                        </v-list-item-subtitle>-->
                  <!--                      </v-list-item-content>-->
                  <!--                      <v-list-item-action>-->
                  <!--                        <v-icon small>-->
                  <!--                          mdi mdi-open-in-new-->
                  <!--                        </v-icon>-->
                  <!--                      </v-list-item-action>-->
                  <!--                    </v-row>-->
                  <!--                  </v-col>-->
                  <!--                </v-list-item>-->
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
        >
          <v-card elevation="0">
            <v-card-title class="text-h4">
              Meet the team!
            </v-card-title>

            <v-list>
              <v-list-item
                class="mb-5"
              >
                We are scientists and software developers from the
                Department of Computational Mass Spectrometry at the
                Technische Universität München (TUM) and
                Cellzome GmbH, a GSK company. We are continuously
                improving and adding
                functionality of ProteomicsDB to enable exploration and
                analysis of
                proteomics and multi-omics data.

                <v-img
                  class="float-right"
                  max-width="100"
                  src="@/assets/home/ProteomicsDB_Logo_transparent.png"
                />
              </v-list-item>

              <v-divider class="my-4" />
              <v-card-title>Team Leader</v-card-title>

              <template
                v-for="person in [...people.leaders]"
              >
                <v-divider
                  :key="`${person.name}-divider`"
                  class="mx-4"
                />
                <v-list-item
                  :key="person.name"
                  class="mb-8"
                >
                  <TeamCard
                    :name="person.name"
                    :role="person.role"
                    :focus="person.focus"
                    :avatar="person.avatar"
                    :social="person.social"
                    :affiliation="person.affiliation"
                    :position="person.position"
                  />
                </v-list-item>
              </template>

              <v-card-title>
                Core Team
              </v-card-title>

              <template
                v-for="person in [...people.coreTeamMembers]"
              >
                <v-divider
                  :key="`${person.name}-divider`"
                  class="mx-4"
                />
                <v-list-item
                  :key="person.name"
                  class="mb-8"
                >
                  <TeamCard
                    :name="person.name"
                    :role="person.role"
                    :focus="person.focus"
                    :avatar="person.avatar"
                    :social="person.social"
                    :affiliation="person.affiliation"
                    :position="person.position"
                  />
                </v-list-item>
              </template>

              <v-card-title>Core Team Emeriti</v-card-title>
              <template
                v-for="person in [...people.coreTeamEmeriti]"
              >
                <v-divider
                  :key="`${person.name}-divider`"
                  class="mx-4"
                />
                <v-list-item
                  :key="person.name"
                  class="mb-8"
                >
                  <TeamCard
                    :name="person.name"
                    :role="person.role"
                    :focus="person.focus"
                    :avatar="person.avatar"
                    :social="person.social"
                    :affiliation="person.affiliation"
                    :position="person.position"
                  />
                </v-list-item>
              </template>

              <v-card-title>Former Team Members</v-card-title>
              <v-list-item
                v-for="(person, i) in [...people.formerTeamMembers]"
                :key="i"
              >
                {{ person.name }} &#8212; {{ person.role }}
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import citations from '@/assets/json/citations.json'
import people from '@/assets/json/people.json'

import TeamCard from '@/components/TeamCard'

export default {
  components: {
    TeamCard
  },
  data: () => ({
    citations,
    people
  })
}
</script>
