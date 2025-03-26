--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: completed_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.completed_tasks (
    id integer NOT NULL,
    user_id integer,
    task_name text NOT NULL,
    description text,
    category text NOT NULL,
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.completed_tasks OWNER TO postgres;

--
-- Name: completed_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.completed_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.completed_tasks_id_seq OWNER TO postgres;

--
-- Name: completed_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.completed_tasks_id_seq OWNED BY public.completed_tasks.id;


--
-- Name: health_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_tasks (
    id integer NOT NULL,
    task_name character varying(100) NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    description text,
    user_id integer NOT NULL,
    completed boolean DEFAULT false
);


ALTER TABLE public.health_tasks OWNER TO postgres;

--
-- Name: health_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_tasks_id_seq OWNER TO postgres;

--
-- Name: health_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_tasks_id_seq OWNED BY public.health_tasks.id;


--
-- Name: personal_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_tasks (
    id integer NOT NULL,
    task_name character varying(100) NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    description text,
    user_id integer NOT NULL,
    completed boolean DEFAULT false
);


ALTER TABLE public.personal_tasks OWNER TO postgres;

--
-- Name: personal_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_tasks_id_seq OWNER TO postgres;

--
-- Name: personal_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_tasks_id_seq OWNED BY public.personal_tasks.id;


--
-- Name: shopping_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shopping_tasks (
    id integer NOT NULL,
    task_name character varying(100) NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    description text,
    user_id integer NOT NULL,
    completed boolean DEFAULT false
);


ALTER TABLE public.shopping_tasks OWNER TO postgres;

--
-- Name: shopping_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shopping_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shopping_tasks_id_seq OWNER TO postgres;

--
-- Name: shopping_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shopping_tasks_id_seq OWNED BY public.shopping_tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_userid_seq OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: work_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_tasks (
    id integer NOT NULL,
    task_name character varying(100) NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    description text,
    user_id integer NOT NULL,
    completed boolean DEFAULT false
);


ALTER TABLE public.work_tasks OWNER TO postgres;

--
-- Name: work_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_tasks_id_seq OWNER TO postgres;

--
-- Name: work_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_tasks_id_seq OWNED BY public.work_tasks.id;


--
-- Name: completed_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.completed_tasks ALTER COLUMN id SET DEFAULT nextval('public.completed_tasks_id_seq'::regclass);


--
-- Name: health_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_tasks ALTER COLUMN id SET DEFAULT nextval('public.health_tasks_id_seq'::regclass);


--
-- Name: personal_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_tasks ALTER COLUMN id SET DEFAULT nextval('public.personal_tasks_id_seq'::regclass);


--
-- Name: shopping_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_tasks ALTER COLUMN id SET DEFAULT nextval('public.shopping_tasks_id_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Name: work_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_tasks ALTER COLUMN id SET DEFAULT nextval('public.work_tasks_id_seq'::regclass);


--
-- Name: completed_tasks completed_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.completed_tasks
    ADD CONSTRAINT completed_tasks_pkey PRIMARY KEY (id);


--
-- Name: health_tasks health_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_tasks
    ADD CONSTRAINT health_tasks_pkey PRIMARY KEY (id);


--
-- Name: personal_tasks personal_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_tasks
    ADD CONSTRAINT personal_tasks_pkey PRIMARY KEY (id);


--
-- Name: shopping_tasks shopping_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_tasks
    ADD CONSTRAINT shopping_tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: work_tasks work_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_tasks
    ADD CONSTRAINT work_tasks_pkey PRIMARY KEY (id);


--
-- Name: completed_tasks completed_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.completed_tasks
    ADD CONSTRAINT completed_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: health_tasks health_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_tasks
    ADD CONSTRAINT health_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: personal_tasks personal_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_tasks
    ADD CONSTRAINT personal_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: shopping_tasks shopping_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_tasks
    ADD CONSTRAINT shopping_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: work_tasks work_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_tasks
    ADD CONSTRAINT work_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

