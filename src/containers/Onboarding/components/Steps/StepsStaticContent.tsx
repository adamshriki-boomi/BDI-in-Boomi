import { RiverTypes } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import { Play, PlusIcon } from 'components/Icons/components';
import {
  DATA_CONNECTIONS,
  DATA_PIPELINE,
  imageSrc,
  INVITE_MEMBER,
  KNOW_RIVERY,
  ONBOARDING_ADD_CONNECTION,
  ONBOARDING_CREATE_LOGIC_RIVER,
  ONBOARDING_CREATE_S2T,
  ONBOARDING_INVITE,
  ONBOARDING_KITS,
  ONBOARDING_LOGIC_RIVER,
  ONBOARDING_RIVER_TYPES,
  ONBOARDING_RIVERY_INTRODUCTION,
  ONBOARDING_USE_PYTHON,
  ONBOARDING_VIEW_ACTIVITIES,
  PRE_BUILT_SOLUTIONS,
  TRANSFORM_AND_ORCHESTRATE,
} from 'containers/Onboarding/consts';
import { MonitoringIcon } from 'layout/Sidebar/components/icons';
import { DRAFT_UID } from 'store/river';
import { RiverTypeBoxes } from './Step1';
import { KitsStep } from './Step5';
import { AddUserComponent } from './Step6';

export const ONBOARDING_STEPS = {
  STEP_1: {
    title: 'Get to know us',
    id: KNOW_RIVERY,
    substeps: [ONBOARDING_RIVERY_INTRODUCTION, ONBOARDING_RIVER_TYPES],
    button: {
      1: {
        label: 'Watch Video',
        icon: Play,
        videoImage: 'Welcome',
        brightcoveVideoId: '6374537735112',
        videoBgColor: 'blue.200',
      },
    },
    additional_section: {
      title: 'Understanding Data Flow Types',
      component: RiverTypeBoxes,
    },
    sections: {
      section1: {
        title: 'Learn how to smoothly sail across the Platform',
        text: "Welcome! We're excited to have you onboard. <br/> We make it easy to build complex end-to-end ELT data pipelines fast. Watch this short intro video filled with important key concepts of what youʼll be able to do.",
      },
    },
  },
  STEP_2: {
    title: 'Setup your data connections',
    id: DATA_CONNECTIONS,
    substeps: [ONBOARDING_ADD_CONNECTION],
    button: {
      1: {
        label: 'Add Connection',
        icon: PlusIcon,
        staticImage: imageSrc('setup_data_connections'),
        url: {
          pathname: RoutesBuilder.newConnection,
          type: 'legacy',
        },
      },
    },
    sections: {
      section1: {
        text: 'Create connections to your data sources and data targets.<br/><br/>Instantly connect to applications, databases, file storage options, and data warehouses with our fully managed connectors.',
      },
    },
  },
  STEP_3: {
    title: 'Create your first data flow',
    id: DATA_PIPELINE,
    substeps: [ONBOARDING_CREATE_S2T, ONBOARDING_VIEW_ACTIVITIES],
    button: {
      1: {
        label: 'Create Your First Data Flow',
        staticImage: imageSrc('connect_data_source_to_target'),
        url: {
          pathname: RoutesBuilder.sourceToTarget,
          search: `?create_first_river=true`,
          type: 'legacy',
        },
      },
      2: {
        label: 'Visit Activities',
        icon: MonitoringIcon,
        staticImage: imageSrc('monitor_your_data_pipeline'),
        url: {
          pathname: RoutesBuilder.monitoring,
        },
      },
    },
    sections: {
      section1: {
        title: 'Extract your data from your source to target destination',
        text: 'Create your first data flow using a Source to Target Flow.<br/> Easily extract data from any app or database. Load it right into your data lake or cloud data warehouse  in a few clicks. Let’s go!',
      },
      section2: {
        title: 'Monitor your data flow',
        text: "After defining your data extraction, now it's time to monitor and track all your data pipelines and workflows. See what's currently running, past executions details, and exact credit usage, all using the Activities page.",
      },
    },
  },
  STEP_4: {
    title: 'Transform and orchestrate your data using SQL and Python',
    id: TRANSFORM_AND_ORCHESTRATE,
    substeps: [
      ONBOARDING_LOGIC_RIVER,
      ONBOARDING_CREATE_LOGIC_RIVER,
      ONBOARDING_USE_PYTHON,
    ],
    button: {
      1: {
        label: 'Watch Video',
        icon: Play,
        videoImage: 'Logic',
        brightcoveVideoId: '6374535085112',
        videoBgColor: 'red.50',
      },
      2: {
        label: 'Create Your First Logic Flow',
        brightcoveVideoId: '6374535068112',
        url: {
          pathname: RoutesBuilder.riverDraft,
          additionalParams: { type: RiverTypes.LOGIC, river: DRAFT_UID },
        },
      },
      3: {
        label: 'Watch Video',
        icon: Play,
        videoImage: 'Webinar',
        brightcoveVideoId: '6374537341112',
        videoBgColor: 'blue.200',
      },
    },
    sections: {
      section1: {
        title: 'What is a Logic Flow?',
        text: 'A Logic Flow allows you to create a data workflow by using conditions, loops, containers and branching with the flexibility to define any business logic needed. Each Logic Step can be the execution of other Data Flows (i.e. Source to Target Flows), SQL queries/scripts, Python scripts, Actions, and more.<br/> <br/>Some common use cases for Logic Flows are: <br/><ul><li>Combining data from multiple sources</li><li>Modeling data in your data warehouse with the right dependencies</li><li>Prepping data for a BI/dashboarding tool</li><li>Handling unstructured data types</li><li>Triggering other 3rd party applications processes</li><li>Creating workflows to enrich operational systems with data from your data warehouse</li></ul>',
      },
      section2: {
        title: 'Transform your data using SQL',
        text: 'Logic Flows provide SQL Logic Steps that enable in-database transformations, where the queries are executed inside your target cloud data warehouse. Moreover, you can store the results into a table, file storage, variable or DataFrame.<br/> Alternatively, run custom SQL script in the syntax of your cloud data warehouse. This Logic Step type allows for complete flexibility and customization of queries to cleanse, prep or join your data.',
      },
      section3: {
        title: 'Use Python transformations for maximum flexibility',
        text: 'Logic Flows provide Python Logic Steps to solve complex data challenges that cannot be addressed with SQL alone. Like all our other capabilities, the infrastructure is fully managed so all you need to do is type in your Python script to read and write data into DataFrames as part of your complete workflow. <br/><br/> Want to learn more? Watch a short video about Using Python, where you can discover different use cases where your organization can leverage Python to create optimal data workflows. <br/><br/> <small>Note: The Python feature is available for the Professional plan and above.</small>',
      },
    },
  },
  STEP_5: {
    title: 'Get a head start with pre-built solutions',
    id: PRE_BUILT_SOLUTIONS,
    substeps: [ONBOARDING_KITS],
    additional_section: { component: KitsStep },
    sections: {},
  },
  STEP_6: {
    title: 'Invite a team member to join',
    id: INVITE_MEMBER,
    substeps: [ONBOARDING_INVITE],
    additional_section: {
      component: AddUserComponent,
    },
    sections: {},
  },
};
