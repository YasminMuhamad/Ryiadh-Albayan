import React from "react";
import { Navbar } from "./NavBar";
import { Sidebar } from "../../components/SideBar";
import { Layout } from "../../components/Layaout";
import { DashCard } from "../../components/DashCard";
import { PlusCircle, Edit, Trash, PersonStanding, Book, Star } from 'lucide-react';
import { Btn } from "./btn";

export function Dashboard() {
    return (
        <>
            <Navbar />
            <Sidebar />
            <Layout>
                <div style={{ color: 'dark' }}>
                    Dashboard Overview
                </div>
                <div style={{ color: '#6B6B6B' }}>
                    نظرة عامة على لوحة التحكم
                </div>
                <DashCard
                    title={<><PlusCircle style={{ marginRight: '5px', fontSize: '20px' }} /> Teachers</>}
                    subtitle="إدارة المعلمين"
                >
                    <div className="card-stats">
                        <p>Total Teachers: <strong>42</strong></p>
                        <p>Active: <strong>38</strong> | Inactive: <strong>4</strong></p>
                    </div>
                    <div className="card-buttons">
                        <button
                            style={{ backgroundColor: '#0E7C7B', color: '#ffffff', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('add')}
                        >
                            <PlusCircle style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Add
                        </button>

                        <button
                            style={{ backgroundColor: '#FAF9F6', color: '#000000', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('edit')}
                        >
                            <Edit style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Edit
                        </button>

                        <button
                            style={{ backgroundColor: '#FAF9F6', color: '#000000', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('delete')}
                        >
                            <Trash style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Delete
                        </button>

                    </div>
                </DashCard>
                <DashCard
                    title={<><PersonStanding style={{ marginRight: '5px', fontSize: '20px' }} /> Students</>}
                    subtitle="إدارة الطلاب"
                >
                    <div className="card-stats">
                        <p>Total Students: <strong>1,248</strong></p>
                        <p>Active: <strong>1208</strong> | Inactive: <strong>40</strong></p>
                    </div>
                    <div className="card-buttons">
                        <button
                            style={{ backgroundColor: '#0E7C7B', color: '#ffffff', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('add')}
                        >
                            <PlusCircle style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Add
                        </button>

                        <button
                            style={{ backgroundColor: '#FAF9F6', color: '#000000', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('edit')}
                        >
                            <Edit style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Edit
                        </button>

                        <button
                            style={{ backgroundColor: '#FAF9F6', color: '#000000', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('delete')}
                        >
                            <Trash style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Delete
                        </button>

                    </div>
                </DashCard>
                <DashCard
                    title={<><Book style={{ marginRight: '5px', fontSize: '20px' }} /> Courses</>}
                    subtitle="إدارة الدورات"
                >
                    <div className="card-stats">
                        <p>Total Courses: <strong>156</strong></p>
                        <p>Active: <strong>143</strong> | Inactive: <strong>15</strong></p>
                    </div>
                    <div className="card-buttons">
                        <button
                            style={{ backgroundColor: '#0E7C7B', color: '#ffffff', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('add')}
                        >
                            <PlusCircle style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Add
                        </button>

                        <button
                            style={{ backgroundColor: '#FAF9F6', color: '#000000', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('edit')}
                        >
                            <Edit style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Edit
                        </button>

                        <button
                            style={{ backgroundColor: '#FAF9F6', color: '#000000', display: 'inline-flex', alignItems: 'center' }}
                            className="card-button"
                            onClick={() => onButtonClick('delete')}
                        >
                            <Trash style={{ marginRight: '5px', width: '20px', height: '20px' }} />
                            Delete
                        </button>

                    </div>
                </DashCard>

                <DashCard
                    title={<><Star style={{ marginRight: '5px', fontSize: '20px' }} /> Analytics</>}
                    subtitle="إحصائيات عامة"
                >
                    <div className="card-stats">
                        <p>Courses Completed: 892</p>
                           <p> Quizzes Taken: 3,456</p>
                           <p> Avg. Completion Rate: 78%</p>
                          <p>  Active Students: 1,189</p>
                        <p>Active: <strong>1208</strong> | Inactive: <strong>40</strong></p>
                    </div>
                    <div className="card-buttons">


                    </div>
                </DashCard>
                <Btn title={'test'} className={'btn-secondary'} />
            </Layout>
        </>
    )
}